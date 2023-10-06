import axios from 'axios'

const baseUrl = 'http://localhost:10000'

// fileMd5: 文件hash值，唯一标识
// extension：文件扩展名
interface verifyFileType {
  uploadedList: string[],
  url: string
}
export const verifyFile: (fileMd5: string, extension: string) => Promise<verifyFileType> = (fileMd5: string, extension: string) => {
  return new Promise((resolve, reject) => {
    axios({
      url: baseUrl + '/api/upload/verify',
      method: 'POST',
      data: {
        fileMd5, extension
      }
    }).then(result => resolve(result.data)).catch(err => reject(err))
  })
}

export const fileUpload = (data: FormData) => {
  return new Promise((resolve, reject) => {
    axios({
      url: baseUrl + '/api/upload',
      data,
      method: 'POST'
    }).then(result => resolve(result.data)).catch(err => reject(err))
  })
}

// fileMd5: 文件hash值，唯一标识
// extension：文件扩展名
interface fileMergeType {
  code: number,
  message: string
}
export const fileMerge: (fileMd5: string, extension: string) => Promise<fileMergeType> = (fileMd5:string, extension:string) => {
  return new Promise((resolve, reject) => {
    axios({
      url: baseUrl + '/api/upload/merge',
      method: 'POST',
      data: {
        fileMd5, extension
      }
    }).then(result => resolve(result.data)).catch(err => reject(err))
  })
}
