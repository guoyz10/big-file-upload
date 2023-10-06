<template>
  <input ref="fileRef" type="file" @change="fileChange">
  <button @click="upload">上传</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { createChunk, createMd5, getExtension } from './utils'
import { verifyFile, fileUpload, fileMerge } from './request'

const files = ref<File | null>(null)
const fileRef = ref<HTMLInputElement | null>(null)
const fileChange = () => {
  if (fileRef.value?.files && fileRef.value?.files?.length > 0) files.value = fileRef.value?.files[0]
}

const upload = async () => {
  if (!files.value) {
    return console.log('请选择要上传的文件')
  }
  // 创建切片列表
  const chunkList = createChunk(files.value)
  // 生成文件md5值
  const md5 = await createMd5(chunkList)
  console.log(md5)
  // 验证文件状态接口
  const { uploadedList, url } = await verifyFile(md5, getExtension(files.value.name))
  if (url) {
    console.log('文件上传成功')
    return
  }
  // 获取需要上传的切片
  const needUploadList: {
    file: Blob,
    filename: string
  }[] = []
  chunkList.forEach((file: Blob, index: number) => {
    console.log(file)
    const filename = `${md5}-${index}`
    if (uploadedList.indexOf(filename) === -1) {
      needUploadList.push({
        filename,
        file
      })
    }
  })
  // 上传切片
  Promise.all(needUploadList.map(item => {
    // console.log('需要上传的切片', item)
    const data = new FormData()
    data.append('file', item.file)
    data.append('filename', item.filename)
    data.append('fileMd5', md5)
    return fileUpload(data)
  })).then(async (res) => {
    console.log(res)
    // 全部上传成功，合并切片
    const { code } = await fileMerge(md5, getExtension(files.value?.name as string))
    if (code === 200) {
      console.log('文件上传成功')
    }
  }).catch(err => {
    console.log(err)
  })
}
</script>
