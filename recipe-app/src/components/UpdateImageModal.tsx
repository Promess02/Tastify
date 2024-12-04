import React, { useState } from 'react';
import '../App.css';
import Recipe from '../DTO/Recipe';

interface UpdateImageModalProps {
    recipe: Recipe;
    onClose: () => void;
    onSave: (imagePath: string) => void;
}

const UpdateImageModal: React.FC<UpdateImageModalProps> = ({ recipe, onClose, onSave }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePath, setImagePath] = useState(recipe.image_path);
    const [showImageUploaded, setShowImageUploaded] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePath(URL.createObjectURL(file));
            setShowImageUploaded(true);
        }
    };

    const handleSave = async () => {
        if(imageFile){
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('imageName', imageFile.name);
            setImagePath('/images/' + imageFile.name);
    
            try {
                const response = await fetch('http://localhost:4000/upload', {
                    method: 'POST',
                    body: formData,
                });
    
                if (response.ok) {
                    const data = await response.json();
                    onSave(imageFile.name);
                    onClose();
                } else {
                    alert('Failed to upload image');
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Error uploading image');
            }
        } else {
            alert('No image file selected');
        }
        
    };

    return (
        <div className="modal-no-overlay">
            <div className="modal-content">
                <h2>Update Image</h2>
                <img src={imagePath || '/images/gnocci.jpg'} alt={recipe.recipe_name} className='recipe-image-details' />
                <div className="form-group">
                    <label>Upload New Image:</label>
                    <input type="file" onChange={handleImageChange} />
                </div>
                {showImageUploaded && (<p>Image uploaded successfully</p>)}
                <div className="form-actions">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>    
    );
};

export default UpdateImageModal;