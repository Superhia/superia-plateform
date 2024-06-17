// parsing/api/proxy.js
import { IncomingForm } from 'formidable';
import fs from 'fs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form data:', err);
                return res.status(500).json({ error: 'Form data could not be parsed' });
            }

            console.log('Received fields:', fields);
            console.log('Received files:', files);

            const fileStream = fs.createReadStream(files.file.filepath);
            const formData = new FormData();
            formData.append('question', fields.question);
            formData.append('file', fileStream, files.file.originalFilename);

            try {
                const response = await fetch('https://superia.northeurope.cloudapp.azure.com/chatpdf', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`, // Set the Content-Type with boundary
                    },
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(`API call failed with status: ${response.status} and message: ${result.message}`);
                }
                res.status(200).json(result);
            } catch (apiError) {
                console.error('Error forwarding request:', apiError);
                res.status(500).json({ error: 'Failed to forward request' });
            }
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
