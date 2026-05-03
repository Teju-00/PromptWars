import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Example API for constituency lookup (using static data for demo, could be expanded)
  app.post("/api/lookup-constituency", (req, res) => {
    const { pincode } = req.body;
    
    const mockData: Record<string, any> = {
      "500001": { 
        lokSabha: "Hyderabad", 
        assembly: "Goshamahal", 
        phase: "Phase 4",
        booth: {
          name: "St. Georges Grammar School",
          no: "154",
          address: "Abids Road, Hyderabad, Telangana 500001",
          landmark: "Opposite GPO Abids",
          blo: { name: "Rajesh Kumar", contact: "+91 98XXX XXXXX" },
          coordinates: { lat: 17.3912, lng: 78.4772 }
        }
      },
      "110001": { 
        lokSabha: "New Delhi", 
        assembly: "New Delhi", 
        phase: "Phase 6",
        booth: {
          name: "N.P. Primary School",
          no: "42",
          address: "Janpath, Connaught Place, New Delhi 110001",
          landmark: "Near Palika Bazaar",
          blo: { name: "Suman Devi", contact: "+91 99XXX XXXXX" },
          coordinates: { lat: 28.6289, lng: 77.2185 }
        }
      },
      "400001": { 
        lokSabha: "Mumbai South", 
        assembly: "Colaba", 
        phase: "Phase 5",
        booth: {
          name: "Elphinstone College",
          no: "89-A",
          address: "156, Mahatma Gandhi Road, Fort, Mumbai 400001",
          landmark: "Opposite Jehangir Art Gallery",
          blo: { name: "Vikram Shah", contact: "+91 97XXX XXXXX" },
          coordinates: { lat: 18.9284, lng: 72.8315 }
        }
      }
    };
    
    if (mockData[pincode]) {
      res.json(mockData[pincode]);
    } else {
      res.json({ lokSabha: "Unknown", assembly: "Unknown", phase: "TBD", message: "Constituency data for this pincode is being updated." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
