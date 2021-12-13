import { StorageReference, ref, uploadBytes, UploadResult, getDownloadURL} from "firebase/storage";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import FirebaseUploadFileDisplayer from "../FirebaseUploadFileDisplayer";

export interface UploadedFile{
    fileURL:string;
    isPicture:boolean;
    fileName:string;
    originalFileName:string;
}

const FirebaseFileUploader = ({
    processURLFunction,
    multiple = true,
    maxNumberOfFiles = 0,
    accept = "",
    fileNamePrefix = "",
    fireStorageRef,
    disableDownloadURL  = false,
    withPreview = false,
}:{
    processURLFunction:(uploadFileList: UploadedFile[])=>void, //use this function to pass firebase uploaded data out
    multiple?:boolean,
    maxNumberOfFiles?:number,
    accept?:string,
    fileNamePrefix?:string,
    fireStorageRef:StorageReference,
    disableDownloadURL?:boolean,
    withPreview ?: boolean,
}) =>{
    const [fileList, setFileList] = useState<File[]>([]); // fileList is to store raw file
    const [uploadFileList,setUploadFileList] = useState<UploadedFile[]>([]) // uploadFileList is to store file data uploaded to firebase
    const [uploadInputKeyToRefresh, setUploadInputKeyToRefresh] = useState("");
    const [loading, setLoading] = useState<boolean>(false)
    
    //set file list after user select files, will prevent user upload more than max no. of files
    const handleChange = (e:React.FormEvent<HTMLInputElement>)=>{
        let tempFileListCollection = e.currentTarget.files
        // console.log("handleChange ", tempFileListCollection)
        if(tempFileListCollection === null)return
        if(maxNumberOfFiles > 1){
            if(tempFileListCollection?.length > maxNumberOfFiles){
                setUploadInputKeyToRefresh(Math.random().toString(36))
                return alert(`You can upload max ${maxNumberOfFiles} files at most at a time.`)
            }
            if(fileList.length + tempFileListCollection?.length > maxNumberOfFiles){
                setUploadInputKeyToRefresh(Math.random().toString(36))
                // return alert(`You can upload max ${maxNumberOfFiles} files. Remove uploaded files to free the slot.`)
                return alert(`You can upload max ${maxNumberOfFiles} files. Remove uploaded files to free the slot.`)
                
            }
            //for multiple files, concat the filelist and prevent duplicate file
            setUploadInputKeyToRefresh(Math.random().toString(36))
            let fileNameList = fileList.map(e=>e.name)
            let newFileList = [...fileList, ...Array.from(tempFileListCollection).filter(e=>!fileNameList.includes(e.name) ) ]
            setFileList(newFileList)
        }else{
            // for single files, just replace the old record
            setFileList(Array.from(tempFileListCollection))
        }
        
    }

    // upload filelist to firebase storage and return UploadedFile, contain urls and isPicture
    const UploadFileToFireBase = async(tempFileList:File[])=>{
        setLoading(true)
        let tempUploadFileList:UploadedFile[] = []
        // let tempFileList = Array.from(fileList)

        for (const file of tempFileList) {
            let splitedFilenames = file.name.split(".")
            if(splitedFilenames.length < 2){
                // filename format error
                continue
            }
            let suffix = splitedFilenames[splitedFilenames.length - 1]
            // since fileList pass to here contain even uploaded file, prevent re-upload to firebase and reuse old uploaded record
            let oldUploadedFile = uploadFileList.find(e=>e.originalFileName === file.name)
            if(oldUploadedFile){
                tempUploadFileList.push(oldUploadedFile)
                continue
            }

            let fileName = fileNamePrefix === "" ? `${uuidv4()}.${suffix}`:`${fileNamePrefix}-${uuidv4()}.${suffix}`
            const fileRef = ref(fireStorageRef, fileName)
            const uploadRes = await uploadBytes(fileRef, file)

            let fileURL = ""
            if(!disableDownloadURL){
                fileURL = await getDownloadURL(uploadRes.ref)
            }else{
                fileURL = await uploadRes.ref.fullPath
            }
            
            //  pdf = application/pdf
            //  image = image/jpeg or image/any
            tempUploadFileList.push({
                fileName,
                fileURL,
                isPicture: file.type === "application/pdf" ? false : true,
                originalFileName:file.name,
            })
        }
        setUploadFileList(tempUploadFileList)
        // console.log("Finish")
        setLoading(false)
    }

    const handleRemoveUploadedFile = (e:React.MouseEvent<HTMLButtonElement>, originalFileName:string) =>{
        e.preventDefault()
        setFileList([...fileList.filter(e=>e.name !== originalFileName)])
    }

    useEffect(()=>{
        // console.log("fileList change", fileList)
        if(fileList.length === 0){
            UploadFileToFireBase([])
            // processURLFunction([])
            // console.log("clear url")
        }else{
            UploadFileToFireBase(fileList)
        }
        // fileList === null && processURLFunction([])
    },[fileList])

    useEffect(()=>{
        processURLFunction(uploadFileList)
    },[uploadFileList])

    return (
      <div>
          <input type="file" onChange={handleChange} 
            // ref={fileInputRef}
            key={uploadInputKeyToRefresh || ''}
            multiple = {multiple}
            accept={accept}
            className="btn btn-primary" style={{ position: "relative", display: "inline-flex", letterSpacing: "0.02em", alignItems: "center"}}
            disabled={loading}
          />
          {
                loading &&
                <div>Loading ...</div>
          }
          <br/>
          <br/>
          <ol>
            {
                uploadFileList.map((file,index)=>{
                    return(

                        <li key={index} style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                            <button 
                                // className="btn btn-primary"
                                style={{borderRadius:"4px", marginRight:"10px"}}
                                onClick={e=>handleRemoveUploadedFile(e,file.originalFileName)}
                            >
                                <span style={{padding:"10px"}}>x</span>
                            </button>
                            <span style={{flex:1}}>{file.originalFileName}</span>
                            {
                                withPreview &&
                                <FirebaseUploadFileDisplayer file={file} height={50} width={50}/>
                            }
                        </li>
                    )
                })
            }
          </ol>

      </div>
    );
}

export default FirebaseFileUploader