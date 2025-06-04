<template>
  <div class="background">
  <div class="container">
    <header>
      <button @click="goLogin">取消</button>
    </header>
    <main>
      <h1>用户注册</h1>
      <div class="info">
        <div class="userImg">
          <el-upload
              class="avatar-uploader"
              :http-request="upload"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
          >
            <img :src="this.registerForm.avatar" class="avatar" />
          </el-upload>
        </div>

        <div class="line">
          <div class="left">用户名</div>
          <input v-model="this.registerForm.username" type="text" class="right" placeholder="用户名">
        </div>

        <div class="line">
          <div class="left">密码</div>
          <input v-model="this.registerForm.password" type="password" @input="selectUserImg" class="right" placeholder="请填写密码">
        </div>

        <div class="line">
          <div class="left">邮箱</div>
          <input v-model="this.registerForm.email" type="email" class="right" placeholder="请填写邮箱">
        </div>
      </div>

      <div class="tips">
        <input type="checkbox" v-model="checked">我已阅读并同意 <a @click="showTips">&lt;&lt;阿巴阿巴阿巴协议&gt;&gt;</a>
      </div>

      <div class="register">
        <button @click="register" :disabled="!checked">注册</button>
      </div>
    </main>
    <footer>

    </footer>
  </div>
  </div>
</template>

<script>
// import '../assets/css/register.css';

import axios from "axios";

export default {
  data(){
    return {
      registerForm: {
        avatar: '/src/assets/nullUser.png',
        username: '',
        password: '',
        email: ''
      },
      checked: false
    }
  },
  methods:{
    goLogin(){
      this.$router.push('/login')
    },
    showTips(){
      this.$message.info('请先勾选协议')
    },
    upload(file) {
      const formData = new FormData()
      formData.append('avatar', file.file)
      axios.post('/api/upload/register-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).then((res) => {
        if (res.data.code === 222) {
          this.$message.success("上传成功")
          this.registerForm.avatar = res.data.obj
        } else {
          this.$message.error(res.data.msg || "上传失败")
        }
      }).catch((error) => {
        this.$message.error("上传失败：" + (error.response?.data?.msg || error.message))
      })
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式！');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB！');
      }

      return isJPG && isLt2M;
    },
    register(){
      if (this.validateForm()) {
        // 处理邮箱格式
        if (!this.registerForm.email.includes('@')) {
          this.registerForm.email = this.registerForm.email + '@qq.com';
        }
        
        // 发送注册请求
        axios({
          method: 'post',
          url: '/api/users/add',
          data: this.registerForm
        }).then((response) => {
          if (response.data.code === 222) {
            this.$message.success(response.data.msg);
            // 注册成功后跳转到登录页面
            this.$router.push('/login');
          } else {
            this.$message.error(response.data.msg);
          }
        });
      }
    },
    validateForm() {
      if (!this.registerForm.username || this.registerForm.username.length > 10) {
        this.$message.error('请输入有效的用户名（不超过10位）');
        return false;
      }
      if (!this.registerForm.password || this.registerForm.password.length < 5) {
        this.$message.error('密码不能少于5位');
        return false;
      }
      if (!this.registerForm.email) {
        this.$message.error('请输入邮箱');
        return false;
      }
      return true;
    }
  }
}
</script>

<style scoped>
.container{
  max-width: 460px;
  margin: 0 auto;
  min-height: 98vh;
  position: absolute;
  left:0;
  right: 0;

}

header button{
  font-size: 20px;
  border: none;
  color: #57be6a;
}
main{
  width: 100%;
  height: 80vh;
  margin-top: 8%;
}

main div.info{
  width: 100%;
  height: 400px;
  margin-top: 60px;
}
main div.userImg{
  width: 100%;
  height: 100px; /* 调整高度为你需要的值 */
  display: flex;
  align-items: center;
  justify-content: center;
}
main div.userImg img{
  display: block;
  width: 80px;
  height: 80px;
  cursor: pointer;
}

main div.line{
  width: 100%;
  height: 40px;
  border: none;
  margin-top: 20px;
  border-bottom: 1px solid ;
}
main div.line .left{
  float: left;
  line-height: 50px;
  height: 50px;
  padding-left: 20px;
  font-size: 18px;
}
main div.line input{
  display: block;
  float: right;
  width: 80%;
  line-height: 50px;
  height: 40px;
  margin-top: 5px;
  outline: none;
  font-size: 18px;
  border: none;
  background-color: transparent;
}

main div.tips{
  width: 100%;
  height: 30px;
  color: #000;
  margin-top: -30px;
}
main div.tips input{
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  margin-left: 20px;
}
main div.tips a{
  color: #667498;
  cursor: pointer;
}

main div.register{
  width: 100%;
  height: 76px;
  margin-top: 80px;

}
main div.register button{
  display: block;
  width: 80%;
  height: 48px;
  background-color: #07c160;
  border-radius: 5px;
  border: none;
  font-weight: bold;
  color: #fff;
  font-size: 20px;
  margin: 0 auto;
  cursor: pointer;
}
main div.register button:disabled{
  background-color: #7ad7a6;
}

main div.register button:hover{
  background-color: #07c160;
}


.background{
  background-image:url("../assets/preview.jpg");
   max-width: 100%;
  margin: 0 auto;
  min-height: 98vh;
  position: absolute;
  left:0;
  right: 0;
}
</style>