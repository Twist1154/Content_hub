
import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import axios from 'axios';
import { PassThrough } from 'stream';

export async function POST(req: NextRequest) {
    try {
        const { fileUrls } = await req.json();

        if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
            return new NextResponse(JSON.stringify({ error: 'fileUrls array is required.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Use a PassThrough stream to pipe the archive to the response
        const stream = new PassThrough();

        const archive = archiver('zip', {
            zlib: { level: 9 }, // Sets the compression level.
        });

        archive.pipe(stream);

        // Fetch each file and append it to the archive
        await Promise.all(
            fileUrls.map(async (url: string) => {
                try {
                    const response = await axios.get(url, { responseType: 'stream' });
                    // Extract a filename from the URL
                    const filename = url.substring(url.lastIndexOf('/') + 1);
                    archive.append(response.data, { name: filename });
                } catch (error) {
                    // Log the error but don't stop the whole process
                    console.error(`Failed to download or append file: ${url}`, error);
                    // Optionally, add an error log file to the zip
                    archive.append(`Failed to download: ${url}\n`, { name: `error_log.txt` });
                }
            })
        );

        // Finalize the archive and end the stream
        archive.finalize();

        // Set headers to trigger a file download
        const headers = new Headers();
        headers.set('Content-Type', 'application/zip');
        headers.set('Content-Disposition', `attachment; filename="content-archive-${Date.now()}.zip"`);

        // Return the stream as the response body
        return new NextResponse(stream as any, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Error creating zip archive:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to create zip archive.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
