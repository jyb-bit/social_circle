<template>
  <!-- 动态发布页面总容器 -->
  <div class="container">
    <div class="top">
      <!-- 头部区域，包含取消和发布按钮 -->
      <div class="header">
        <div class="left" @click="backIndex">取消</div>
        <div class="right" @click="publish">发布</div>
      </div>
      <!-- 文本输入框 -->
      <textarea v-model="this.content" class="text" placeholder="这一刻的想法..."></textarea>
    </div>

    <div class="bottom">
      <!-- 图片预览和上传区域 -->
      <div class="image-container">
        <!-- 已上传图片预览列表 -->
        <img
            v-for="(image, index) in images"
            :key="index"
            :src="image.url"
            class="avatar"
            @click="viewImage(image.url)"
        />
        <!-- El-Upload 组件作为文件选择触发器 -->
        <el-upload
            class="avatar-uploader"
            action="#"
            list-type="picture-card"
            :http-request="upload"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            multiple
            accept="image/jpeg, image/png"
        >
          <!-- 上传按钮/图标，当图片数量小于9时显示 -->
          <img
              v-if="images.length < 9"
              class="avatar default-avatar"
              src="../assets/insertimg.png"
          />
          <!-- 如果需要加号图标作为上传按钮，可以使用 Element Plus 的 ElIcon 组件 -->
          <!-- <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon> -->
        </el-upload>
      </div>
    </div>
    <!-- 地点信息显示和重新定位按钮 (已删除) -->
    <!-- <span>🏙️地点:{{this.nowIpAddress}}</span>
    <el-button @click="updateAddress" text>重新定位</el-button> -->
  </div>
</template>

<script>
import axios from "axios";

// 设置axios默认配置，基础URL为'/api'
axios.defaults.baseURL = '/api';

export default {
  // 组件数据
  data() {
    return {
      content: '',
      images: [], // 已上传图片的URL列表，每个元素是一个对象 { url: '...' }
      // nowIpAddress: '' // 当前IP地址解析的地理位置信息 (已删除)
    };
  },
  // 组件创建前生命周期钩子
  created() {
    console.log('Publish component created.');
    // 在组件创建时获取当前用户的地理位置 (已删除)
    // this.getAddress();
  },

  // 组件方法
  methods: {
    // 自定义文件上传方法
    upload(file) {
      console.log('Initiating file upload...', file);
      // 检查图片数量限制
      if (this.images.length >= 9) {
        this.$message.warning("最多只能上传 9 张图片");
        console.warn('Upload cancelled: maximum number of images reached.');
        return false;
      }

      // 获取登录信息
      const loginInfo = localStorage.getItem('login_info');
      if (!loginInfo) {
        this.$message.error('请先登录');
        this.$router.push('/login');
        console.error('Upload failed: user not logged in.');
        return false;
      }

      let token;
      try {
        token = JSON.parse(loginInfo).token;
        console.log('Retrieved token from localStorage.');
      } catch (e) {
        this.$message.error('登录信息无效，请重新登录');
        this.$router.push('/login');
        console.error('Failed to parse login info or retrieve token:', e);
        return false;
      }

      // 创建 FormData 对象，用于上传文件
      const formData = new FormData();
      formData.append("file", file.file);
      console.log('FormData created for upload.', formData);

      // 创建上传进度提示
      const loadingInstance = this.$loading({
        lock: true,
        text: '上传中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      console.log('Loading indicator shown.');

      // 发起图片上传请求
      axios.post("/api/upload/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
        // 上传进度事件监听
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          loadingInstance.text = `上传中... ${percentCompleted}%`;
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }).then((res) => {
        // 请求成功
        loadingInstance.close();
        console.log('Upload successful response:', res.data);
        if (res.data.code === 222) {
          this.$message.success("上传成功");
          // 将返回的完整图片URL添加到图片列表
          this.images.push({ url: res.data.obj });
          console.log('Image added to images array:', this.images);
        } else {
          this.$message.error(res.data.msg || "上传失败");
          console.error('Upload failed with server message:', res.data.msg);
        }
      }).catch(error => {
        // 请求失败
        loadingInstance.close();
        console.error('Upload failed:', error);
        if (error.response) {
          // 根据HTTP状态码处理错误
          switch (error.response.status) {
            case 401:
              this.$message.error('登录已过期，请重新登录');
              this.$router.push('/login');
              console.error('Upload failed: 401 Unauthorized.');
              break;
            case 413:
              this.$message.error('文件太大，请选择小于2MB的图片');
              console.error('Upload failed: 413 Payload Too Large.');
              break;
            default:
              this.$message.error(error.response.data?.msg || "上传失败，请稍后重试");
              console.error('Upload failed with HTTP status:', error.response.status, error.response.data);
          }
        } else {
          this.$message.error("网络错误，请检查网络连接");
          console.error('Upload failed: network error.', error);
        }
      });
    },
    // 文件上传前的校验钩子
    beforeAvatarUpload(file) {
      console.log('Before upload hook triggered:', file);
      // 检查图片数量是否超出限制
      if (this.images.length >= 9) {
        this.$message.warning("最多只能上传 9 张图片");
        console.warn('Before upload cancelled: maximum number of images reached.');
        return false;
      }

      // 校验文件类型
      const isJPG = file.type === "image/jpeg" || file.type === "image/png";
      // 校验文件大小
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error("上传图片只能是 JPG 或 PNG 格式！");
        console.warn('Before upload cancelled: invalid file type.');
        return false;
      }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB！");
        console.warn('Before upload cancelled: file size exceeds 2MB.');
        return false;
      }

      console.log('File validation passed.');
      return true;
    },
    // 获取当前地理位置 (已删除)
    // getAddress() {
    //   console.log('Attempting to get current address...');
    //   axios({
    //     method: "get",
    //     url: "http://ip-api.com/json/?lang=zh-CN", // 第三方IP地址查询服务
    //   }).then((response) => {
    //     console.log('Get address response:', response.data);
    //     if (response.data.status === 'success') {
    //       const country = response.data.country || '';
    //       const region = response.data.regionName || '';
    //       const city = response.data.city || '';

    //       // 构建地址字符串，只包含非空的部分
    //       const addressParts = [country, region, city].filter(part => part && part !== '-');
    //       const address = addressParts.length > 0 ? addressParts.join('-') : '未知';

    //       this.nowIpAddress = address;
    //       localStorage.setItem("login_address", JSON.stringify(address)); // 将地址存储到本地存储
    //       console.log('Address set and stored:', address);
    //     } else {
    //       console.error('Get address failed:', response.data);
    //       this.$message.error("获取地址失败，请检查网络后重试");
    //       this.nowIpAddress = '未知';
    //       localStorage.setItem("login_address", JSON.stringify('未知'));
    //     }
    //   }).catch(error => {
    //     console.error('Error getting address:', error);
    //     this.$message.error("获取地址失败，请检查网络后重试");
    //     this.nowIpAddress = '未知';
    //     localStorage.setItem("login_address", JSON.stringify('未知'));
    //   });
    // },
    // 更新地理位置 (已删除)
    // updateAddress() {
    //   console.log('Attempting to update address...');
    //   axios({
    //     method: "get",
    //     url: "http://ip-api.com/json/?lang=zh-CN", // 第三方IP地址查询服务
    //   }).then((response) => {
    //     console.log('Update address response:', response.data);
    //     if (response.data.status === 'success') {
    //       const country = response.data.country || '';
    //       const region = response.data.regionName || '';
    //       const city = response.data.city || '';

    //       // 构建地址字符串，只包含非空的部分
    //       const addressParts = [country, region, city].filter(part => part && part !== '-');
    //       const address = addressParts.length > 0 ? addressParts.join('-') : '未知';

    //       this.nowIpAddress = address;
    //       localStorage.setItem("login_address", JSON.stringify(address));
    //       this.$message.success("定位已更新");
    //       console.log('Address updated and stored:', address);
    //     } else {
    //       console.error('更新地址失败:', response.data);
    //       this.$message.error("更新地址失败，请检查网络后重试");
    //     }
    //   }).catch(error => {
    //     console.error('Error updating address:', error);
    //     this.$message.error("更新地址失败，请检查网络后重试");
    //   });
    // },
    // 返回主页
    backIndex() {
      console.log('Navigating back to index page.');
      this.$router.push("/index");
    },
    // 获取当前格式化时间
    getCurrentTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      console.log('Current time:', formattedTime);
      return formattedTime;
    },
    // 发布朋友圈动态
    publish() {
      console.log('Initiating post publication...');
      // 从sessionStorage获取用户ID
      const useriD = sessionStorage.getItem("userID");
      let userID;
      try {
        userID = JSON.parse(useriD);
        console.log('Retrieved userID from sessionStorage:', userID);
      } catch (e) {
        console.error('Failed to parse userID from sessionStorage:', e);
        this.$message.error('获取用户信息失败，请重新登录');
        // 可以考虑跳转到登录页或进行其他错误处理
        return;
      }

      // 拼接图片URL字符串
      const imageUrls = this.images.map((image) => image.url).join(',');
      console.log('Image URLs for post:', imageUrls);
      // 获取当前时间
      const currentTime = this.getCurrentTime();

      // 获取地址 (已删除)
      // let address = this.nowIpAddress || localStorage.getItem("login_address");
      // console.log('Raw address from state or localStorage:', address);
      // if (address) {
      //   try {
      //     address = JSON.parse(address);
      //     console.log('Parsed address:', address);
      //   } catch (e) {
      //     console.error('Failed to parse stored address:', e);
      //     address = '未知';
      //   }
      // } else {
      //   address = '未知';
      //   console.log('Address is null or empty, setting to "未知".');
      // }
      // console.log('Final address for post:', address);

      // 构造请求数据
      const requestData = {
        userID: userID,
        content: this.content,
        image: imageUrls,
        time: currentTime,
        // address: address // 已删除
      };
      console.log('Post request data:', requestData);

      // Get login info from localStorage
      const loginInfo = localStorage.getItem('login_info');
      if (!loginInfo) {
        this.$message.error('请先登录');
        this.$router.push('/login');
        console.error('Publish failed: user not logged in.');
        return;
      }
      let token;
      try {
        token = JSON.parse(loginInfo).token;
        console.log('Retrieved token for publish request.');
      } catch (e) {
        console.error('Failed to parse login info or retrieve token for publish request:', e);
        this.$message.error('登录信息无效，请重新登录');
        this.$router.push('/login');
        return;
      }

      // 发起发布动态请求
      axios({
        method: 'post',
        url: '/api/posts/add',
        data: requestData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        // 请求成功
        console.log('Publish response:', response.data);
        if (response.data.code === 222) {
          this.$message.success(response.data.msg);
          this.$router.push("/index");
          console.log('Post published successfully, navigating to index.');
        } else {
          this.$message.error(response.data.msg);
          console.error('Publish failed with server message:', response.data.msg);
        }
      }).catch(error => {
        // 请求失败
        console.error('Publish failed:', error);
        if (error.response && error.response.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          this.$router.push('/login');
          console.error('Publish failed: 401 Unauthorized.');
        } else {
          this.$message.error('发布失败: ' + error.message);
          console.error('Publish failed with error:', error);
        }
      });
    },
    // 预览图片 (目前只打印URL)
    viewImage(imageUrl) {
      console.log("View Image: ", imageUrl);
      // TODO: 实现图片预览弹窗或新页面打开
    },
  },
  // 进入路由前生命周期钩子
  beforeRouteEnter(to, from, next) {
    console.log('Entering publish route.', { to, from });
    // 添加背景色 margin:0;padding:0是为了解决vue四周有白边的问题
    document.querySelector("body").setAttribute("style", "margin:0;padding:0");
    next();
  },
  // 离开路由生命周期钩子 (可选，如果需要清理body样式可以在这里移除)
  // beforeRouteLeave(to, from, next) {
  //   console.log('Leaving publish route.', { to, from });
  //   document.querySelector("body").removeAttribute("style");
  //   next();
  // }
};
</script>

<style scoped>
/* 组件的Scoped样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  background-color: #fff;
  max-width: 500px; /* 限制最大宽度 */
  margin: 0 auto; /* 居中显示 */
  min-height: 90vh; /* 最小高度 */
  padding: 10px;
}

/* 图片容器样式，使用flex布局实现图片自动换行 */
.image-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px; /* 图片之间的间距 */
  margin-top: 10px; /* 添加一些顶部外边距 */
}

/* 单个图片预览样式 */
.avatar {
  width: 100px;
  height: 100px;
  object-fit: cover; /* 保持图片比例 */
  border-radius: 4px; /* 圆角 */
}

/* 默认上传图片图标样式 */
.default-avatar {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer; /* 鼠标悬停时显示手型 */
}

/* 顶部区域样式 */
.container .top {
  border-bottom: 1px solid #bcbcbc; /* 底部边框 */
  width: 94%; /* 宽度 */
  margin: 0 auto; /* 居中 */
  height: 100%; /* 高度 */
}

/* 头部导航样式 */
.container .top .header {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: space-between; /* 左右对齐 */
  align-items: center; /* 垂直居中 */
}

/* 头部左侧文字样式 (取消) */
.container .top .header .left {
  color: #000000;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

/* 头部右侧文字样式 (发布) */
.container .top .header .right {
  color: #32b431; /* 绿色 */
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

/* 头部右侧文字悬停样式 */
.container .top .header .right:hover {
  background-color: #999; /* 悬停背景色 */
}

/* 文本输入框样式 */
.container .top textarea.text {
  display: block;
  width: 100%;
  margin-top: 10px;
  border: none;
  color: #232323;
  font-size: 20px;
  outline: none; /* 去掉选中时的蓝色边框 */
  text-indent: 1em; /* 首行缩进 */
  min-height: 100px; /* 最小高度 */
  max-width: 100%;
  min-width: 100%;
}

/* 底部区域样式 */
.container .bottom {
  width: 100%;
}

/* 调整 el-upload 的样式，使其看起来像一个图片卡片或上传按钮 */
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 100px; /* 设置 el-upload 触发器的大小与图片预览一致 */
  height: 100px;
  display: flex; /* 使内部内容居中 */
  justify-content: center;
  align-items: center;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary); /* 悬停边框颜色 */
}

/* 如果使用 ElIcon 的加号图标，可以给它设置样式 */
/* .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
} */

/* 删除或修改原来的 #picInput 样式，因为它现在包含了 image-container */
/*
.container .bottom #picInput {
  width: 100%;
  margin-top: 10px;
}
*/
</style>
