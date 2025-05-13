import axios from 'axios';

export const uploadImage = async (formData: FormData, imageFile: File, onSave: (fileName: string) => void, onClose: () => void) => {
    try {
        const response = await axios.post('http://localhost:4000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            onSave(imageFile.name);
            onClose();
        } else {
            alert('Failed to upload image');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image');
    }
};