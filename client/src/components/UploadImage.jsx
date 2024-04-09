/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Text} from "@chakra-ui/react";

export default function UploadImage({ onDrop }) {

    const [selectedFile, setSelectedFile] = useState(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: 'image/*',
        onDrop: (acceptedFiles) => {
          setSelectedFile(acceptedFiles[0]);
          onDrop(acceptedFiles);
        },
      });    

    return (
        <Box
            {...getRootProps()}
            p={4}
            borderWidth={2}
            height={300}
            width={400}
            borderStyle="dashed"
            borderColor={isDragActive ? 'teal' : 'gray.200'}
            borderRadius="md"
            textAlign="center"
            cursor="pointer"
            >
            <input {...getInputProps()} />
            {selectedFile ? (
                <Text justifyContent={'center'} alignContent={'center'} >{selectedFile.name}</Text>
            ) : (
                <Text justifyContent={'center'} alignContent={'center'} >Drag 'n' drop an image here, or click to select a file</Text>
            )}
        </Box>
    );
}
