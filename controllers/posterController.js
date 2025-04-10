const Poster = require('../model/posterModel');
const multer = require('multer');

const uploadCloudinary = require('../middlewares/uploadMiddleware')

// Get all posters
const getAllPosters = async (req, res) => {
    try {
        const posters = await Poster.find({});
        res.json({ success: true, message: "Posters retrieved successfully.", data: posters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a poster by ID
const getPosterById = async (req, res) => {
    try {
        const posterID = req.params.id;
        const poster = await Poster.findById(posterID);
        if (!poster) {
            return res.status(404).json({ success: false, message: "Poster not found." });
        }
        res.json({ success: true, message: "Poster retrieved successfully.", data: poster });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new poster
const createPoster = async (req, res) => {
    try {
        if (req.fileValidationError) {
            console.log("fileValidationError ==> ",req.fileValidationError);
            return sendError(res, req.fileValidationError);
        }
        const { posterName, productId } = req.body;
    
        if (!posterName) {
            return res.status(400).json({ success: false, message: "Poster name is required." });
        }

        // Validate file upload
        if (req.file) {
            // If the file is uploaded successfully, the Cloudinary URL will be in req.file.secure_url
            let imageUrl = req.file.path || 'no_url';

            // Save the new poster
            const newPoster = new Poster({
                posterName: posterName,
                productId: productId,
                imageUrl: imageUrl
            });

            await newPoster.save();
            res.json({ success: true, message: "Poster created successfully." });
        } else {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }
    } catch (err) {
        // Handle multer file size limit error
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: "File size is too large. Maximum filesize is 5MB." });
        }
        // General error handling
        console.error("Poster upload failed:", err);
        return res.status(500).json({ success: false, message: err.message });        
    }
};


// Update a poster
const updatePoster = async (req, res) => {
    try {
        const posterID = req.params.id;
        
        if (req.fileValidationError) {
            console.log("fileValidationError ==> ",req.fileValidationError);
            return sendError(res, req.fileValidationError);
        }
        
        const { posterName, productId } = req.body;

        let imageUrl = req.body.imageUrl || '';

        // If a new file is uploaded, use the secure URL from Cloudinary
        if (req.file) {
            imageUrl = req.file.path;
        }

        // Validate required fields
        if (!posterName || !imageUrl) {
            return res.status(400).json({ success: false, message: "Poster name and image are required." });
        }

        try {
            // Find and update the poster by ID
            const updatedPoster = await Poster.findByIdAndUpdate(
                posterID,
                { posterName, productId, imageUrl },
                { new: true }  // To return the updated poster
            );

            // Handle case where the poster is not found
            if (!updatedPoster) {
                return res.status(404).json({ success: false, message: "Poster not found." });
            }

            // Return success response
            res.json({ success: true, message: "Poster updated successfully.", data: updatedPoster });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
    catch (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: "File size is too large. Maximum filesize is 5MB." });
        }

        return res.status(500).json({ success: false, message: err.message });
    }
};

// Delete a poster
const deletePoster = async (req, res) => {
    const posterID = req.params.id;
    try {
        const deletedPoster = await Poster.findByIdAndDelete(posterID);
        if (!deletedPoster) {
            return res.status(404).json({ success: false, message: "Poster not found." });
        }
        res.json({ success: true, message: "Poster deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Helper function to handle multer errors
const handleMulterError = (err, res) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            err.message = 'File size is too large. Maximum filesize is 5MB.';
        }
        console.log(`Upload error: ${err.message}`);
        return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
        console.log(`Upload error: ${err.message}`);
        return res.status(500).json({ success: false, message: err.message });
    }
};


module.exports = {
    getAllPosters,
    getPosterById,
    createPoster,
    updatePoster,
    deletePoster
};