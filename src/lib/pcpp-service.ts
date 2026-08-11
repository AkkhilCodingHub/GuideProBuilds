import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface PCPPart {
  name: string;
  price: string | number;
  store: string;
  link: string;
  [key: string]: any;
}

function getMisePythonPath(): string {
  if (process.env.PYTHON_PATH) return process.env.PYTHON_PATH;

  const localVenvPy = path.join(process.cwd(), '.venv', 'bin', 'python');
  if (fs.existsSync(localVenvPy)) return localVenvPy;

  const localVenvPy3 = path.join(process.cwd(), '.venv', 'bin', 'python3');
  if (fs.existsSync(localVenvPy3)) return localVenvPy3;

  const home = process.env.HOME || '';
  const miseShim3 = path.join(home, '.local/share/mise/shims/python3');
  if (fs.existsSync(miseShim3)) return miseShim3;

  const miseShim = path.join(home, '.local/share/mise/shims/python');
  if (fs.existsSync(miseShim)) return miseShim;

  return 'python3';
}

class PCPPService {
  private get pythonPath() {
    return getMisePythonPath();
  }
  private scriptPath = path.join(process.cwd(), 'src', 'lib', 'pcpp_api.py');

  async searchParts(type: string, query?: string, region: string = 'in'): Promise<PCPPart[]> {
    return new Promise((resolve, reject) => {
      const pyBin = this.pythonPath;
      console.log(`[PCPP API] Executing python script using environment: ${pyBin}`);
      
      const args = [this.scriptPath, type, region];
      if (query) args.push(query);

      const pythonProcess = spawn(pyBin, args, {
        env: { ...process.env, PATH: `${path.join(process.env.HOME || '', '.local/share/mise/shims')}:${process.env.PATH}` }
      });
      
      let data = '';
      let error = '';

      pythonProcess.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });

      pythonProcess.stderr.on('data', (chunk) => {
        error += chunk.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`PCPP API Script failed with code ${code}: ${error}`);
          return reject(new Error(error || `Python script exited with code ${code}`));
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(parsed.error));
          }
          resolve(parsed as PCPPart[]);
        } catch (e) {
          console.error('Failed to parse PCPP API response:', data);
          reject(new Error('Failed to parse live PCPartPicker response'));
        }
      });
    });
  }

  async syncPCPPToDatabase(region: string = 'in') {
    const { storage } = await import('./storage');
    const categories = ['cpu', 'gpu', 'ram', 'motherboard', 'storage', 'psu', 'case'];
    const syncedParts: any[] = [];

    console.log(`[PCPP Sync] Initiating LIVE market sync from PCPartPicker Python API (Region: ${region})...`);

    for (const category of categories) {
      try {
        const rawParts = await this.searchParts(category, undefined, region);
        if (!Array.isArray(rawParts)) continue;

        console.log(`[PCPP Sync] Retrieved ${rawParts.length} live ${category} components.`);

        for (const item of rawParts) {
          if (!item.name) continue;

          let numericPrice = 0;
          if (typeof item.price === 'number') {
            numericPrice = item.price;
          } else if (typeof item.price === 'string') {
            const cleaned = item.price.replace(/[^0-9.]/g, '');
            numericPrice = parseFloat(cleaned) || 0;
          }

          const knownBrands = ['Intel', 'AMD', 'NVIDIA', 'Corsair', 'ASUS', 'MSI', 'Gigabyte', 'G.Skill', 'Samsung', 'NZXT', 'Crucial', 'Noctua', 'Razer', 'EVGA', 'Kingston', 'Zotac', 'Sapphire', 'Deepcool'];
          let brand = knownBrands.find(b => item.name.toLowerCase().includes(b.toLowerCase())) || 'Generic';

          const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const externalId = `pcpp-${category}-${slug}`;

          const partObj = {
            externalId,
            name: item.name,
            type: category,
            brand,
            price: numericPrice || 5000,
            specs: item.specs || item.details || {},
            description: `Live component from PCPartPicker (${item.store || 'Market'}).`,
            pcppLink: item.link || item.url || '',
            inStock: true,
            stockCount: 20,
            rating: 4.8,
            reviewCount: 15,
            lastUpdated: new Date()
          };

          const saved = await storage.upsertPartByExternalId(externalId, partObj);
          syncedParts.push(saved);
        }
      } catch (err: any) {
        console.warn(`[PCPP Sync] Could not fetch live category '${category}':`, err.message);
      }
    }

    console.log(`[PCPP Sync] Completed live market sync. Total saved: ${syncedParts.length}`);
    return syncedParts;
  }
}

export const pcppService = new PCPPService();
