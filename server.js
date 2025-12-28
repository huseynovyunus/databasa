// Server üçün tələb olunan modullar
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Qovluq yollarını idarə etmək üçün
const fs = require('fs'); // Fayl sistemi əməliyyatları üçün

// ⚠️ KRİTİK ADDIM: ƏSAS AZURE FUNKSİYASINI YÜKLƏYİN.
const azureFunction = require('./HttpTrigger/index.js'); 

const app = express();
const port = 8080; // Nginx Reverse Proxy bu porta yönləndirəcək.

// Storage Konfiqurasiyası: Çıxarılan media fayllarını (məsələn, şəkilləri) saxlamaq üçün
const storageDir = 'extracted_media/';
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

app.use(bodyParser.json());

// =========================================================
// 1. STORAGE HİSSƏSİ (Statik Fayl Servisi)
// =========================================================

// adiniz.duckdns.org/media/filename.jpg ünvanına gələn sorğuları
// yerli 'extracted_media' qovluğuna yönləndirir.
app.use('/media', express.static(storageDir));

console.log(`💾 Storage yolu quraşdırıldı: /media -> ${path.resolve(storageDir)}`);


// =========================================================
// 2. COMPUTE HİSSƏSİ (API Adapter)
// =========================================================

// Express.js marşrutu
// /api/extract ünvanına gələn POST, GET və digər sorğuları emal edir.
app.all('/api/extract', async (expressReq, expressRes) => {
    
    // Express Sorğu Obyektini Azure Funksiyası Sorğu Obyektinə Çeviririk
    const azureReq = {
        method: expressReq.method,
        query: expressReq.query,
        body: expressReq.body,
        headers: expressReq.headers, 
    };

// Azure Funksiyası üçün mock 'context' obyekti yaradırıq
const azureContext = {
    // Log funksiyasını birbaşa funksiya kimi təyin edirik
    log: Object.assign((...args) => console.log(...args), {
        info: (...args) => console.info(...args),
        error: (...args) => console.error(...args),
        warn: (...args) => console.warn(...args),
        verbose: (...args) => console.log(...args)
    }),
    res: {}, // Nəticəni saxlamaq üçün boş obyekt
};

    try {
        // Azure Funksiyasını Express.js parametrləri ilə çağırırıq
        await azureFunction(azureContext, azureReq);

        // Nəticəni Express Cavabına köçürürük
        const responseData = azureContext.res;

        // Status kodunu və başlıqları ötürürük
        expressRes.status(responseData.status || 200)
                  .set(responseData.headers || {})
                  .send(responseData.body);

    } catch (error) {
        console.error('❌ Express Adapter Xətası:', error);
        expressRes.status(500).json({ error: 'Server Tətbiq Xətası' });
    }
});


app.listen(port, () => {
    console.log(`✅ Deep Scraper API http://localhost:${port} ünvanında işləyir.`);
    console.log(`   Nginx hədəfi: ${port}`);
});