import { spawn } from 'child_process';
import path from 'path';

export interface PCPPart {
  name: string;
  price: string;
  store: string;
  link: string;
  [key: string]: any;
}

class PCPPService {
  private pythonPath = 'python3';
  private scriptPath = path.join(process.cwd(), 'server', 'pcpp_api.py');

  async searchParts(type: string, query?: string, region: string = 'in'): Promise<PCPPart[]> {
    return new Promise((resolve, reject) => {
      const args = [this.scriptPath, type, region];
      if (query) args.push(query);

      const pythonProcess = spawn(this.pythonPath, args);
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
          return reject(new Error(error || `Process exited with code ${code}`));
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error(parsed.error));
          }
          resolve(parsed as PCPPart[]);
        } catch (e) {
          console.error('Failed to parse PCPP API response:', data);
          reject(new Error('Failed to parse API response'));
        }
      });
    });
  }
}

export const pcppService = new PCPPService();
