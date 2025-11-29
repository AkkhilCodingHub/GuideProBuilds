// src/features/support/api/support.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { supportService } from '../services/supportService';
import { validateRequest } from '../../../middleware/validateRequest';

const router = Router();

router.post(
  '/tickets',
  validateRequest({
    body: z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email address'),
      subject: z.string().min(1, 'Subject is required'),
      message: z.string().min(1, 'Message is required'),
      priority: z.enum(['low', 'medium', 'high']).default('medium'),
      category: z.string().optional(),
      sendConfirmation: z.boolean().default(true),
    }),
  }),
  async (req, res, next) => {
    try {
      await supportService.createTicket(req.body);
      res.status(201).json({
        success: true,
        message: 'Support ticket submitted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

// FAQ categories with detailed questions
router.get('/faq/categories', (req, res) => {
  res.json([
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'pc-building', name: 'PC Building' },
    { id: 'compatibility', name: 'Compatibility' },
    { id: 'troubleshooting', name: 'Troubleshooting' },
    { id: 'account', name: 'Account & Settings' },
  ]);
});

// Comprehensive FAQ data
router.get('/faq', (req, res) => {
  res.json({
    categories: [
      {
        id: 'getting-started',
        name: 'Getting Started',
        faqs: [
          {
            id: 'gs-1',
            question: 'How do I start building my PC with PC Guide Pro?',
            answer: 'Click on "PC Builder" in the navigation menu or the "Start Your Build" button on the homepage. You can choose a preset (Gaming, Workstation, or Budget) or start from scratch. Our smart compatibility checker will guide you through selecting compatible components.'
          },
          {
            id: 'gs-2',
            question: 'Do I need technical knowledge to use this tool?',
            answer: 'No! PC Guide Pro is designed for users of all skill levels. We provide detailed explanations, compatibility checks, and recommendations. Our guides section also includes beginner-friendly tutorials for first-time builders.'
          },
          {
            id: 'gs-3',
            question: 'Is PC Guide Pro free to use?',
            answer: 'Yes, PC Guide Pro is completely free to use. All features including the PC Builder, comparison tools, and guides are available at no cost.'
          }
        ]
      },
      {
        id: 'pc-building',
        name: 'PC Building',
        faqs: [
          {
            id: 'pb-1',
            question: 'What components do I need for a complete PC build?',
            answer: 'A complete PC build typically requires: CPU (processor), GPU (graphics card), motherboard, RAM (memory), storage (SSD/HDD), power supply (PSU), and a case. Depending on your CPU, you may also need a CPU cooler. Our builder ensures you select all necessary components.'
          },
          {
            id: 'pb-2',
            question: 'How do I know if my components are compatible?',
            answer: 'PC Guide Pro automatically checks compatibility as you select components. We verify socket types, RAM compatibility, power requirements, and physical dimensions. Any potential issues are flagged immediately with explanations and alternatives.'
          },
          {
            id: 'pb-3',
            question: 'What is the difference between Gaming and Workstation builds?',
            answer: 'Gaming builds prioritize high frame rates and visual quality with powerful GPUs and fast memory. Workstation builds focus on multi-core performance for tasks like video editing, 3D rendering, and software development, often featuring more cores and higher RAM capacity.'
          },
          {
            id: 'pb-4',
            question: 'How much should I budget for a gaming PC?',
            answer: 'Budget gaming PCs start around $500-700 for 1080p gaming. Mid-range builds ($1000-1500) handle 1440p well. High-end builds ($2000+) are ideal for 4K gaming and future-proofing. Use our Budget preset to find the best value for your price range.'
          }
        ]
      },
      {
        id: 'compatibility',
        name: 'Compatibility',
        faqs: [
          {
            id: 'cp-1',
            question: 'Why does my CPU need a specific motherboard socket?',
            answer: 'CPUs are designed to fit specific socket types. Intel uses sockets like LGA 1700 or LGA 1200, while AMD uses AM4 or AM5. The motherboard socket must match your CPU for it to physically fit and function properly.'
          },
          {
            id: 'cp-2',
            question: 'What is RAM compatibility and why does it matter?',
            answer: 'RAM must be compatible with your motherboard in terms of type (DDR4 vs DDR5), speed, and maximum capacity. Incompatible RAM either will not work at all or may run at reduced speeds, limiting performance.'
          },
          {
            id: 'cp-3',
            question: 'How do I know if my GPU will fit in my case?',
            answer: 'Check your case specifications for maximum GPU length, and compare it to your graphics card dimensions. Our builder automatically checks this, flagging any cases that cannot accommodate your selected GPU.'
          },
          {
            id: 'cp-4',
            question: 'What wattage power supply do I need?',
            answer: 'We calculate the total power draw of your components and recommend a PSU with adequate headroom (typically 20-30% above calculated usage). This ensures stable operation and allows for future upgrades.'
          }
        ]
      },
      {
        id: 'troubleshooting',
        name: 'Troubleshooting',
        faqs: [
          {
            id: 'ts-1',
            question: 'My PC will not POST (Power On Self Test). What should I check?',
            answer: 'Common causes include: 1) RAM not seated properly - reseat your memory sticks firmly. 2) CPU power cable not connected - ensure the 4/8-pin CPU power is plugged in. 3) Front panel connectors wrong - double-check power switch pins. 4) GPU not seated - reseat your graphics card. Try booting with minimal components (CPU, one RAM stick, no GPU) to isolate the issue.'
          },
          {
            id: 'ts-2',
            question: 'My system is overheating. How can I fix this?',
            answer: 'Check that: 1) All fans are working and properly oriented (intake/exhaust). 2) CPU cooler is mounted correctly with thermal paste applied. 3) Cable management is not blocking airflow. 4) Dust is not clogging filters or heatsinks. Consider adding more case fans or upgrading your CPU cooler if temperatures remain high.'
          },
          {
            id: 'ts-3',
            question: 'Why is my computer randomly shutting down?',
            answer: 'This often indicates: 1) Overheating - check temperatures with monitoring software. 2) Insufficient PSU wattage - verify your power supply meets system requirements. 3) RAM issues - run Windows Memory Diagnostic. 4) Driver problems - update or rollback recent driver changes.'
          },
          {
            id: 'ts-4',
            question: 'My new GPU is not being detected. What should I do?',
            answer: 'Try these steps: 1) Reseat the GPU firmly in the PCIe slot. 2) Connect required PCIe power cables from your PSU. 3) Make sure your monitor is connected to the GPU, not motherboard. 4) Update motherboard BIOS if using newer hardware. 5) Try the GPU in a different PCIe slot if available.'
          },
          {
            id: 'ts-5',
            question: 'How do I troubleshoot blue screen errors (BSOD)?',
            answer: 'Note the error code displayed. Common causes: BAD_POOL_HEADER often means driver issues, MEMORY_MANAGEMENT suggests RAM problems, KERNEL_SECURITY_CHECK can indicate driver conflicts. Run Driver Verifier, check for Windows updates, and test RAM with MemTest86+.'
          }
        ]
      },
      {
        id: 'account',
        name: 'Account & Settings',
        faqs: [
          {
            id: 'ac-1',
            question: 'How do I save my PC build?',
            answer: 'Your builds are saved automatically in your browser. For cloud sync across devices, you can export your build configuration as a shareable link. This allows you to access your builds from anywhere.'
          },
          {
            id: 'ac-2',
            question: 'Can I share my build with others?',
            answer: 'Yes! Each build has a unique shareable link. Click the "Share" button on your completed build to copy the link. Recipients can view your component list and even use it as a starting point for their own build.'
          },
          {
            id: 'ac-3',
            question: 'How do I contact support?',
            answer: 'Use the contact form on this page to submit a support request. Include your email, describe your issue in detail, and select an appropriate priority level. We typically respond within 24-48 hours.'
          }
        ]
      }
    ]
  });
});

export default router;