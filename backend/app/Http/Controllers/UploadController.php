<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Cloudinary\Cloudinary;
use Cloudinary\Transformation\Resize;

class UploadController extends Controller
{
    /**
     * Upload an image to Cloudinary.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // max 5MB
            'folder' => 'nullable|string|in:doctors,patients,documents,profiles,licenses,general'
        ]);

        $folder = $request->input('folder', 'general');
        $file = $request->file('file');

        try {
            $cloudinary = new Cloudinary([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key'    => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ],
            ]);

            $upload = $cloudinary->uploadApi()->upload(
                $file->getRealPath(),
                [
                    'folder' => 'cabinet_management/' . $folder,
                    'resource_type' => 'image',
                    'overwrite' => true,
                ]
            );

            return response()->json([
                'url' => $upload['secure_url'],
                'public_id' => $upload['public_id'],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Upload failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
