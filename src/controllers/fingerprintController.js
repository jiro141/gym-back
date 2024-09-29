// // Supongamos que el WebSdk tiene FingerprintReader definido dentro de él
// const { FingerprintReader, SampleFormat } = require('../../WebSdk/index'); // Importar WebSdk localmente

// exports.captureFingerprint = async (req, res) => {
//     try {
//         const reader = new FingerprintReader();

//         // Iniciar la adquisición de huellas dactilares en formato de imagen PNG
//         await reader.startAcquisition(SampleFormat.PngImage);

//         // Escuchar el evento de adquisición de muestras
//         reader.on('samplesAcquired', (event) => {
//             const fingerprintData = event.samples[0]; // La primera muestra
//             console.log('Huella capturada:', fingerprintData);

//             // Enviar la huella dactilar en la respuesta
//             res.status(200).json({ success: true, fingerprint: fingerprintData });
//         });

//         // Manejar los errores
//         reader.on('error', (error) => {
//             console.error('Error al capturar la huella dactilar:', error);
//             res.status(500).json({ success: false, error: error.message });
//         });

//     } catch (error) {
//         console.error('Error general:', error);
//         res.status(500).json({ success: false, error: error.message });
//     } finally {
//         // Asegúrate de detener la adquisición cuando termines
//         await reader.stopAcquisition();
//     }
// };
