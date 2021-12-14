import React, { useEffect, useState } from 'react';
import { UploadedFile } from '../FirebaseFileUploader';

// import firebase from '../../config/firebaseConfig'
// import { Document, Page } from 'react-pdf';
const FirebaseUploadFileDisplayer = ({
    file,
    height,
    width,
}:{
    file:UploadedFile|string,
    height?:number,
    width?:number
}) =>{
    const [localFile, setLocalFile] = useState<UploadedFile>()
    // const [loading, setLoading] = useState<boolean>(true)

    const showDirectURLORGetSignedURL = async() =>{
        // detect if data is UploadFile or pureURL
        if(typeof file === 'string'){
            try {
               let newFile = JSON.parse(file) as  UploadedFile
               setLocalFile(newFile)
            } catch (error) {
                let newFile:UploadedFile = {
                    fileURL:file,
                    isPicture:false,
                    contentType:"",
                    filePath:"",
                    originalFileName:"unknown",
                    fileName:"unknown"
                }
                setLocalFile(newFile)
            }
        }else{
            if(/http/.test(file.fileURL)){
                // is a direct URL, just display it 
                setLocalFile(file)
            }else{
                // const URL = await firebase.storage().ref(file.fileURL).bucket.
                // should get special URL from backend for limited access
                setLocalFile(file)
            }
        }

    }
    useEffect(()=>{
        showDirectURLORGetSignedURL()
    },[file])
    return (
        <>
            <a href={localFile?.fileURL} target={"_blank"}  rel="noopener noreferrer" style={{height:height?height : 'auto', width:width?width : 'auto', display:"flex", justifyContent:"center", alignItems:"center"}}>
                {
                    localFile?.isPicture ? 
                        <img src={localFile?.fileURL} style={{height:"100%", width:"100%"}}/>
                    :
                        <p><span>File</span></p>
                }
            </a>
        </>
    )
}

export default FirebaseUploadFileDisplayer
