// Sadəcə Storage bağlantısını yoxlayır

const { BlobServiceClient } = require('@azure/storage-blob');

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING; 
const CONTAINER_NAME = 'testcontainer'; 

module.exports = async function (context, req) {
    context.log('Storage Connection Test Initiated.');
    
    if (!AZURE_STORAGE_CONNECTION_STRING) {
        context.res = {
            status: 500,
            body: "XƏTA: AZURE_STORAGE_CONNECTION_STRING parametrlərdə tapılmadı. Zəhmət olmasa Configuration bölməsini yoxlayın."
        };
        return;
    }

    try {
        // Blob Service-ə qoşulmağa cəhd edirik
        const BLOB_SERVICE_CLIENT = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = BLOB_SERVICE_CLIENT.getContainerClient(CONTAINER_NAME);

        // Sadəcə konteynerin mövcudluğunu yoxlayırıq
        await containerClient.exists(); 

        context.res = {
            status: 200,
            body: "UĞUR: Blob Storage Bağlantısı işləyir. İndi Puppeteer kodunu bərpa edə bilərik."
        };

    } catch (error) {
        context.log.error('Storage Connection Error:', error);
        context.res = {
            status: 500,
            body: `BAĞLANTI XƏTASI: Bağlantı sətirində problem var. Logları yoxlayın. Xəta: ${error.message}`
        };
    }
};
