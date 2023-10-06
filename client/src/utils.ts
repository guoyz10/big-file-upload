import SparkMD5 from 'spark-md5'

// 创建切片
export const chunkSize = 10 * 1024 * 1024
export const createChunk = (file: File) => {
  console.log(file)
  const chunkList = []
  for (let i = 0; i < file.size; i += chunkSize) {
    console.log(i, i + chunkSize)
    chunkList.push(file.slice(i, i + chunkSize))
  }
  console.log(chunkList)
  return chunkList
}

// 使用spark-md5生成文件的唯一标识(使用哈希算法md5生成文件的hash值)
export const createMd5: (chunkList: Blob[]) => Promise<string> = (chunkList: Blob[]) => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const loadNext = (index: number) => {
      const fileReader = new FileReader()
      fileReader.readAsArrayBuffer(chunkList[index])
      fileReader.onload = (e) => {
        console.log(index)
        index++
        spark.append(e.target?.result as ArrayBuffer)
        // 当前切片是最后一个
        if (index === chunkList.length) {
          resolve(spark.end())
          // return
        } else {
          loadNext(index)
        }
      }
      fileReader.onerror = e => {
        reject(e)
      }
    }
    loadNext(0)
  })
}

// 获取文件名后缀
export const getExtension = (fileName: string) => {
  const arr = fileName.split('.')
  if (arr.length > 0) {
    return arr[arr.length - 1]
  }
  return ''
}
