<template>
  <div class="background">
  <div class="container">
    <!-- <header>
      <button @click="goShouYe">×</button>
    </header> -->
    <main>
      <h1 ><span style="color: black;">{{loginType}}</span>登录</h1>
      <div class="info">
        <div class="userImg">
          <img :src="UserImgUrl" >
        </div>

        <div class="line">
          <div class="left" >账号</div>
          <input v-model="usernameOrEmail" type="text" class="right" :placeholder="loginType">
        </div>

        <div class="line">
          <div class="left" >密码</div>
          <input v-model="password" @focus="selectUserImg" type="password" class="right" placeholder="请填写密码">
        </div>
      </div>

      <div class="switch">
        <button @click="switchLoginType">{{ loginTypeText }}</button>
      </div>

      <div class="login">
        <button @click="login" :disabled="usernameOrEmail===''||password===''">登录</button>
        
      </div>
    </main>
    <footer>
      <div class="box">
       <button @click="goRegister()" class="register">注册</button>

       
      </div>
    </footer>
  </div>
  </div>
</template>

<script>
import '../assets/css/login.css';
import axios from "axios";

export default {
  data(){
    return{
      UserImgUrl:'/src/assets/BootImage.png',
      loginType:'用户名',
      loginTypeText:'用邮箱登录',
      usernameOrEmail:'',
      password:'',
    }
  },
  methods:{
    goShouYe(){
      this.$router.push('/')
    },
        goRegister(){
      this.$router.push('/register');
    },
    switchLoginType(){
      this.usernameOrEmail =''
      this.password = ''
      this.loginType = this.loginType === '用户名' ? '邮箱' : '用户名'
      this.loginTypeText = this.loginTypeText === '用邮箱登录' ? '用户名登录' : '用邮箱登录'
    },
    selectUserImg(){
      if (!this.usernameOrEmail) return;
      
      const url = this.loginType === '用户名' 
        ? `/api/users/searchAvatarByUsername/${this.usernameOrEmail}`
        : `/api/users/searchAvatarByEmail/${this.usernameOrEmail}`;
      
      axios.get(url)
        .then(res => {
          if (res.data.code === 222) {
            this.UserImgUrl = res.data.obj;
          }
        })
        .catch(error => {
          console.error('获取头像失败:', error);
        });
    },
    login(){
      if (!this.usernameOrEmail || !this.password) {
        this.$message.error(`${this.loginType}和密码不能为空`);
        return;
      }

      let requestData = {};
      let url = '';

      if (this.loginType === '用户名') {
        requestData = {
          username: this.usernameOrEmail,
          password: this.password
        };
        url = '/api/users/loginByUserAndPwd';
      } else {
        requestData = {
          email: this.usernameOrEmail,
          password: this.password
        };
        url = '/api/users/loginByEmailAndPwd';
      }

      axios({
        method: 'post',
        url: url,
        data: requestData
      }).then((response) => {
        if (response.data.code === 222) {
          this.$message.success(response.data.msg);
          localStorage.setItem("login_info", JSON.stringify(response.data.obj));
          sessionStorage.setItem("userID", JSON.stringify(response.data.obj.userId));
          this.$router.push('/index');
        } else {
          this.$message.error(response.data.msg || '登录失败');
        }
      }).catch(error => {
        console.error('登录失败:', error);
        if (error.response) {
          // 服务器返回错误响应
          this.$message.error(error.response.data.msg || '登录失败，请稍后重试');
        } else if (error.request) {
          // 请求发送失败
          this.$message.error('网络连接失败，请检查网络设置');
        } else {
          // 其他错误
          this.$message.error('登录失败，请稍后重试');
        }
      });
    }
  }
}
</script>

<style scoped>
.background{
  background-image:url("../assets/preview.jpg");
   max-width: 100%;
  margin: 0 auto;
  min-height: 98vh;
  position: absolute;
  left:0;
  right: 0;
}
.register{
     display: block;
    width: 100%;
    height: 40px;
    background-color: #3a6be9bb;
    border-radius: 5px;
    border: none;
    font-weight: bold;
    color: #fff;
    font-size: 20px;
    margin-bottom: 0px;
    cursor: pointer;
}
</style>