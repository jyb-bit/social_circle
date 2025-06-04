<template>
  <div class="container">
    <div class="left-menu" style="width: 30%; height: 100%; background-color: white; position: fixed; left: 0; top: 0; bottom: 0; overflow-y: auto; border-right: 1px solid #e6e6e6;">
      <!-- 侧边菜单栏 -->

      <el-col :span="24">

        <el-menu default-active="2" class="el-menu-vertical-demo" background-color="white" text-color="black"
          active-text-color="#ffd04b" router>
          <!--            <h1 style="text-align: center">你好</h1>-->


          <div class="nickname-container">
            <img :src="user.avatar" class="userImg">
            <span class="nickname">{{ user.nickname }}</span>
          </div>




          <el-menu-item @click="ShowDialogVisible">
            <el-icon>
              <document />
            </el-icon>
            <span>个人中心</span>
          </el-menu-item>
          <el-menu-item @click="logout">
            <el-icon>
              <setting />
            </el-icon>
            <span>退出登录</span>

          </el-menu-item>
          <el-menu-item @click="handleCameraClick">
            <el-icon>
              <edit />
            </el-icon>
            <span>发布</span>
          </el-menu-item>
        </el-menu>
      </el-col>
    </div>
    <el-dialog
      v-model="dialogVisible"
      title="个人信息"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="user-info-dialog">
        <div class="background-image-preview" :style="{ backgroundImage: `url(${user.backgroundImage})` }">
          <el-upload
            class="background-uploader"
            action="http://localhost:3001/api/upload/background"
            name="file"
            :show-file-list="false"
            :before-upload="handleBackgroundUpload"
            :headers="uploadHeaders"
          >
            <el-button type="primary" size="small">更换背景</el-button>
          </el-upload>
        </div>
        <div class="avatar-container">
          <img :src="user.avatar" class="user-avatar-large">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:3001/api/upload/avatar"
            name="file"
            :show-file-list="false"
            :before-upload="handleAvatarUpload"
            :headers="uploadHeaders"
          >
            <el-button type="primary" size="small" class="avatar-upload-button">更换头像</el-button>
          </el-upload>
        </div>
        <div class="info-container">
          <div class="info-item">
            <span class="label">用户名：</span>
            <span class="value">{{ user.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">昵称：</span>
            <span class="value">{{ user.nickname }}</span>
            <el-button type="primary" size="small" @click="editUserInfo('nickname')">修改</el-button>
          </div>
          <div class="info-item">
            <span class="label">邮箱：</span>
            <span class="value">{{ user.email || '未设置' }}</span>
          </div>
          <div class="info-item signature">
            <span class="label">个性签名：</span>
            <span class="value">{{ user.signature }}</span>
            <el-button type="primary" size="small" @click="editUserInfo('signature')">修改</el-button>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 朋友圈背景壁纸 -->


    <!-- 动态容器 -->
    <div class="bottom" style="height: 100%; margin: 0; margin-left: 30%; width: 70%;">
      <div class="background-image-container">
        <!-- 朋友圈发布内容 -->
        <el-row class="friend-circle" ref="friendCircle">
          <el-col :span="24" v-for="post in posts" :key="post.postID">
            <el-card class="post">
              <div slot="header">
                <img class="post-avatar" :src="post.author.avatar" alt="发布者头像" @click="showAuthorInfo(post.author.userId)">
                <span class="post-nickname" @click="showAuthorInfo(post.author.userId)">{{ post.author.nickname }}</span>
              </div>
              <div class="post-content">
                <p>{{ post.content }}</p>
                <img v-for="(image, index) in post.images" :key="index" class="post-image" :src="image"
                  @click="toggleFullscreen(image)" alt="说说图片">
              </div>
              <div class="post-footer">
                <div class="left">
                  <!-- 显示发布时间和地点 -->
                  <div class="post-info">
                    <span class="post-time">🕑 {{ formatTime(post.time) }}</span>
                    <span class="post-address" v-if="post.address">🏙️ {{ post.address }}</span>
                  </div>
                </div>
                <div class="right">
                  <!-- 点赞和评论按钮 -->
                  <div class="post-actions">
                    <i class="fa" :class="{ 'fa-heart': isLiked(post), 'fa-heart-o': !isLiked(post) }" @click="toggleLike(post)"></i>
                    <el-button @click="handleComment(post, 'show')" text>评论</el-button>
                    <template v-if="post.author.userId === user.userId">
                      <el-button @click="handlePost(post, 'edit')" text>修改</el-button>
                      <el-button @click="handlePost(post, 'delete')" text>删除</el-button>
                    </template>
                  </div>
                </div>
              </div>
              <!-- 显示点赞人名列表和评论列表 -->
              <div class="post-comments">
                <div v-if="post.likeUsernames && post.likeUsernames.length > 0" class="post-likes">
                  点赞：{{ post.likeUsernames.join(', ') }}
                </div>
                <div v-if="post.comments && post.comments.length > 0" class="post-comments-list">
                  <div v-for="(comment, index) in post.comments" :key="comment.commentID" class="post-comment">
                    <div class="main-comment">
                      <span class="comment-author">{{ comment.nickname }}</span>：
                      <span @click="showMore(comment.commentID)">{{ comment.content }}</span>
                      <div class="moreMenu" v-show="comment.commentID === selectedCommentId">
                        <p @click="handleComment(post, 'copy', comment)">复制</p>
                        <p @click="handleComment(post, 'delete', comment)">删除</p>
                        <p @click="handleComment(post, 'reply', comment)">回复</p>
                      </div>
                    </div>
                    <!-- 显示回复评论 -->
                    <div v-if="comment.replies && comment.replies.length > 0" class="reply-comments">
                      <div v-for="reply in comment.replies" :key="reply.commentID" class="reply-comment">
                        <span class="comment-author">{{ reply.nickname }}</span>
                        <span class="reply-to">回复</span>
                        <span class="comment-author">{{ reply.parentNickname }}</span>：
                        <span @click="showMore(reply.commentID)">{{ reply.content }}</span>
                        <div class="moreMenu" v-show="reply.commentID === selectedCommentId">
                          <p @click="handleComment(post, 'copy', reply)">复制</p>
                          <p @click="handleComment(post, 'delete', reply)" >删除</p>
                          <p @click="handleComment(post, 'reply', reply)">回复</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 评论输入框 -->
              <el-input v-show="post.showCommentInput" class="comment-input" v-model="newComment" placeholder="发表评论..."
                @keyup.enter="handleComment(post, 'send')" />
              <!-- 提交评论按钮 -->
              <el-button v-show="post.showCommentInput" class="comment-submit" @click="handleComment(post, 'send')"
                type="success">提交
              </el-button>

            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    <div id="goTop" @click="goTop"> ⬆</div>
    <!-- 添加发布者信息弹窗 -->
    <el-dialog v-model="authorDialogVisible" title="发布者信息" width="50%">
      <div class="user-info-dialog" v-if="currentAuthor">
        <div class="background-image-preview" :style="{ backgroundImage: `url(${currentAuthor.backgroundImage})` }">
        </div>
        <div class="avatar-container">
          <img :src="currentAuthor.avatar" class="user-avatar-large">
        </div>
        <div class="info-container">
          <div class="info-item">
            <span class="label">用户名：</span>
            <span class="value">{{ currentAuthor.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">昵称：</span>
            <span class="value">{{ currentAuthor.nickname }}</span>
          </div>
          <div class="info-item signature">
            <span class="label">个性签名：</span>
            <span class="value">{{ currentAuthor.signature || '这个人很懒，什么都没写~' }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="authorDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加图片预览对话框 -->
    <el-dialog
      v-model="imagePreviewVisible"
      width="80%"
      :show-close="true"
      :close-on-click-modal="true"
      class="image-preview-dialog"
    >
      <div class="image-preview-container">
        <img :src="currentPreviewImage" class="preview-image" />
      </div>
    </el-dialog>

    <!-- 添加编辑帖子的对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑帖子"
      width="50%"
      :close-on-click-modal="false"
    >
      <div class="edit-post-container">
        <el-input
          v-model="editingPost.content"
          type="textarea"
          :rows="4"
          placeholder="请输入帖子内容"
        />
        <div class="image-preview-container" v-if="editingPost.images && editingPost.images.length > 0">
          <div v-for="(image, index) in editingPost.images" :key="index" class="image-preview-item">
            <img :src="image" class="preview-image" />
            <el-button
              type="danger"
              size="small"
              class="delete-image-btn"
              @click="removeImage(index)"
            >
              删除
            </el-button>
          </div>
        </div>
        <div class="upload-container">
          <el-upload
            action="http://localhost:3001/api/upload/post"
            :headers="uploadHeaders"
            :show-file-list="false"
            :before-upload="handleImageUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-button type="primary">添加图片</el-button>
          </el-upload>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';
import { Document, Location, Medal, Minus, Monitor, Setting, Edit } from "@element-plus/icons-vue";

// 设置axios默认配置
axios.defaults.baseURL = 'http://localhost:3001/api';

export default {
  components: { Medal, Monitor, Minus, Setting, Document, Location, Edit },
  data() {
    return {
      // 用户信息对象
      user: {
        userId: '',
        username: '',
        avatar: '',
        nickname: '',
        email: '',
        backgroundImage: '',
        signature: '',
      },
      posts: [], // 朋友圈帖子列表
      sidebarVisible: false,
      showCommentInput: false,
      newComment: "",
      isFullscreen: false,
      moreMenuStatus: false,
      selectedCommentId: -1,
      dialogVisible: false,
      replyingToCommentID: null,
      authorDialogVisible: false,
      currentAuthor: null,
      uploadHeaders: {
        Authorization: ''
      },
      imagePreviewVisible: false,
      currentPreviewImage: '',
      editDialogVisible: false,
      editingPost: {
        postID: null,
        content: '',
        images: []
      },
    };
  },

  // ==================== 生命周期钩子 ====================
  created() {
    console.log('组件创建，开始初始化...');
    // 检查用户登录状态
    const loginInfo = localStorage.getItem('login_info');
    if (!loginInfo) {
      console.log('未检测到登录信息，跳转到登录页');
      this.$message.error('请先登录');
      this.$router.push('/login');
      return;
    }

    // 设置上传请求头
    const login_info = JSON.parse(loginInfo);
    if (login_info && login_info.token) {
      console.log('设置认证token');
      this.uploadHeaders.Authorization = `Bearer ${login_info.token}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${login_info.token}`;
    }

    // 加载用户信息和朋友圈数据
    this.loadUserInfoAndBackgroundImage();
    this.getAll();
    this.upDateComment();
  },

  methods: {
    // ==================== 用户信息相关方法 ====================
    async ShowDialogVisible() {
      console.log('打开个人信息对话框');
      this.dialogVisible = true;
      await this.loadUserInfoAndBackgroundImage();
    },

    async editUserInfo(type) {
      try {
        const loginInfo = JSON.parse(localStorage.getItem('login_info'));
        const { value } = await this.$prompt(
          `请输入新的${type === 'nickname' ? '昵称' : '个性签名'}`,
          `修改${type === 'nickname' ? '昵称' : '个性签名'}`,
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: this.user[type]
          }
        );

        if (value) {
          const response = await axios({
            method: 'put',
            url: '/api/users/update',
            data: {
              userId: this.user.userId,
              [type]: value
            },
            headers: {
              'Authorization': `Bearer ${loginInfo.token}`
            }
          });

          if (response.data.code === 222) {
            this.user[type] = value;
            loginInfo[type] = value;
            localStorage.setItem('login_info', JSON.stringify(loginInfo));
            this.$message.success('修改成功');
          } else {
            this.$message.error(response.data.msg || '修改失败');
          }
        }
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消修改');
        } else {
          console.error('修改失败:', error);
          this.$message.error('修改失败，请稍后重试');
        }
      }
    },

    async loadUserInfoAndBackgroundImage() {
      console.log('开始加载用户信息...');
      const logininfo = localStorage.getItem("login_info");
      const useriD = sessionStorage.getItem("userID");
      
      if (!logininfo || !useriD) {
        console.log('登录信息缺失，跳转到登录页');
        this.$message.error('请先登录');
        this.$router.push('/login');
        return;
      }

      try {
        const login_info = JSON.parse(logininfo);
        const userID = JSON.parse(useriD);
        console.log('正在获取用户ID:', userID, '的信息');
        
        // 获取完整的用户信息
        const response = await axios.get(`/api/users/${userID}`);
        console.log('获取到的用户信息:', response.data);
        
        if (response.data.code === 222) {
          const userData = response.data.obj;
          // 更新用户信息
          this.user = {
            userId: userID,
            username: userData.username || login_info.username,
            nickname: userData.nickname || login_info.nickname,
            email: userData.email || login_info.email,
            avatar: userData.avatar || login_info.avatar,
            backgroundImage: userData.backgroundImage || login_info.backgroundImagePath || 'http://localhost:3001/uploads/backgrounds/default-background.jpg',
            signature: userData.signature || '这个人很懒，什么都没写~'
          };
          
          // 更新本地存储
          login_info.nickname = this.user.nickname;
          login_info.avatar = this.user.avatar;
          login_info.backgroundImagePath = this.user.backgroundImage;
          login_info.signature = this.user.signature;
          localStorage.setItem('login_info', JSON.stringify(login_info));
          
          console.log('用户信息更新完成:', this.user);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 使用本地存储的信息作为后备
        const login_info = JSON.parse(logininfo);
        this.user = {
          userId: JSON.parse(useriD),
          username: login_info.username,
          nickname: login_info.nickname,
          email: login_info.email,
          avatar: login_info.avatar,
          backgroundImage: login_info.backgroundImagePath || 'http://localhost:3001/uploads/backgrounds/default-background.jpg',
          signature: login_info.signature || '这个人很懒，什么都没写~'
        };
      }
    },

    // ==================== 朋友圈帖子相关方法 ====================
    getAll() {
      console.log('开始获取朋友圈数据...');
      axios.get('/api/posts/all')
        .then(response => {
          console.log('获取到的朋友圈数据:', response.data.obj);
          this.posts = response.data.obj.map(post => {
            post.images = post.image ? post.image.split(',') : [];
            return post;
          });
        })
        .catch(error => {
          console.error('获取朋友圈数据失败:', error);
          if (error.response && error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error('获取帖子失败: ' + error.message);
          }
        });
    },

    // ==================== 评论相关方法 ====================
    async upDateComment() {
      console.log('开始更新评论数据...');
      try {
        // 获取最新评论数据
        const response = await axios({
          method: 'get',
          url: '/api/comments/updates'
        });
        console.log('获取到的评论数据:', response.data);

        if (response.data && response.data.obj) {
          const newCommentsData = response.data.obj;
          console.log('开始处理评论数据...');
          
          // 遍历帖子列表
          this.posts.forEach(post => {
            // 找到当前帖子的评论数据
            const commentsForPost = newCommentsData.filter(comment => comment.postID === post.postID);
            console.log(`帖子 ${post.postID} 的评论:`, commentsForPost);

            // 将评论分为主评论和回复评论
            const mainComments = commentsForPost.filter(comment => !comment.parentComment);
            const replyComments = commentsForPost.filter(comment => comment.parentComment);

            // 更新帖子的评论数据，将回复评论组织到对应的主评论下
            post.comments = mainComments.map(comment => ({
              commentID: comment.commentID,
              content: comment.content,
              nickname: comment.user.nickname,
              parentCommentID: null,
              replies: replyComments
                .filter(reply => reply.parentComment.commentID === comment.commentID)
                .map(reply => ({
                  commentID: reply.commentID,
                  content: reply.content,
                  nickname: reply.user.nickname,
                  parentCommentID: reply.parentComment.commentID,
                  parentNickname: reply.parentComment.user.nickname
                }))
            }));
            
            // 更新评论者信息
            post.commenters = commentsForPost.map(comment => comment.user.nickname);

            // 确保评论数组存在
            if (!post.comments) {
              post.comments = [];
            }
            if (!post.commenters) {
              post.commenters = [];
            }

            console.log(`更新后的帖子 ${post.postID} 评论:`, post.comments);
          });
        }
      } catch (error) {
        console.error('获取或处理评论失败:', error);
        if (error.response && error.response.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          this.$router.push('/login');
        }
      }
    },

    // ==================== 点赞相关方法 ====================
    isLiked(post) {
      return post.likeUsernames && post.likeUsernames.includes(this.user.nickname);
    },

    toggleLike(post) {
      console.log('处理点赞操作，帖子ID:', post.postID);
      const logininfo = localStorage.getItem("login_info");
      const useriD = sessionStorage.getItem("userID");
      const login_info = JSON.parse(logininfo);
      const userID = JSON.parse(useriD);

      if (!login_info || !login_info.token) {
        console.log('未检测到登录信息，跳转到登录页');
        this.$message.error('请先登录');
        this.$router.push('/login');
        return;
      }

      const hasLiked = post.likeUserIds && post.likeUserIds.includes(userID);
      const requestData = { userID: userID, postID: post.postID };

      if (hasLiked) {
        console.log('执行取消点赞操作');
        // 取消点赞
        axios({
          method: 'post',
          url: '/api/likes/remove',
          params: requestData,
          headers: {
            'Authorization': `Bearer ${login_info.token}`
          }
        }).then(response => {
          if (response.data.code === 222) {
            this.getAll();
            this.upDateComment();
            this.$message.success(response.data.msg);
            if (post.likeUserIds) {
              post.likeUserIds = post.likeUserIds.filter(id => id !== userID);
            }
          }
        }).catch(error => {
          console.error('取消点赞失败:', error);
          if (error.response && error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error('取消点赞失败: ' + error.message);
          }
        });
      } else {
        console.log('执行点赞操作');
        // 添加点赞
        axios({
          method: 'post',
          url: '/api/likes/addLike',
          params: requestData,
          headers: {
            'Authorization': `Bearer ${login_info.token}`
          }
        }).then(response => {
          if (response.data.code === 222) {
            this.getAll();
            this.upDateComment();
            this.$message.success(response.data.msg);
            if (!post.likeUserIds) {
              post.likeUserIds = [];
            }
            post.likeUserIds.push(userID);
          }
        }).catch(error => {
          console.error('点赞失败:', error);
          if (error.response && error.response.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error('点赞失败: ' + error.message);
          }
        });
      }
    },

    // ==================== 工具方法 ====================
    /**
     * 格式化时间显示
     * @param {string} time - 时间字符串
     * @returns {string} 格式化后的时间字符串
     */
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },

    /**
     * 处理用户退出登录
     * 清除本地存储的登录信息并跳转到登录页
     */
    logout() {
      console.log('执行退出登录操作');
      this.$confirm("将退出该账号，是否继续？", "提示", { type: "info" }).then(() => {
        this.$router.push('/');
        sessionStorage.removeItem('userID');
        localStorage.removeItem("login_info");
        this.$message.success("退出成功！");
      }).catch(() => {
        this.$message.info("取消操作");
      });
    },

    /**
     * 处理页面滚动到顶部
     */
    goTop() {
      window.scrollTo(0, 0);
    },

    /**
     * 处理发布按钮点击
     * 跳转到发布页面
     */
    handleCameraClick() {
      console.log('跳转到发布页面');
      this.$router.push('/publish');
    },

    /**
     * 处理图片预览
     * @param {string} imageUrl - 图片URL
     */
    toggleFullscreen(imageUrl) {
      this.currentPreviewImage = imageUrl;
      this.imagePreviewVisible = true;
    },

    // ==================== 朋友圈帖子相关方法 ====================
    /**
     * 处理帖子相关操作（编辑、删除、点赞）
     * @param {Object} post - 帖子对象
     * @param {string} action - 操作类型：'edit'|'delete'|'like'
     */
    async handlePost(post, action) {
      console.log(`处理帖子操作: ${action}`, { post });
      
      try {
        const loginInfo = JSON.parse(localStorage.getItem('login_info'));
        
        if (!loginInfo?.token) {
          this.$message.error('请先登录');
          this.$router.push('/login');
          return;
        }

        if (post.author.userId !== this.user.userId) {
          this.$message.error('只能操作自己的帖子');
          return;
        }

        switch (action) {
          case 'edit':
            // 初始化编辑状态
            this.editingPost = {
              postID: post.postID,
              content: post.content,
              images: post.images || []
            };
            this.editDialogVisible = true;
            break;

          case 'delete':
            const deleteResponse = await axios({
              method: 'delete',
              url: `/api/posts/${post.postID}`,
              headers: {
                'Authorization': `Bearer ${loginInfo.token}`
              }
            });

            if (deleteResponse.data.code === 222) {
              await this.getAll();
              await this.upDateComment();
              this.$message.success('删除成功');
            }
            break;
        }
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消操作');
        } else {
          console.error('操作失败:', error);
          if (error.response?.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error('操作失败，请稍后重试');
          }
        }
      }
    },

    /**
     * 获取所有朋友圈帖子
     * 包括帖子的图片、评论等信息
     */
    async getAll() {
      console.log('开始获取朋友圈数据...');
      try {
        const response = await axios.get('/api/posts/all');
        console.log('获取到的朋友圈数据:', response.data.obj);
        this.posts = response.data.obj.map(post => {
          post.images = post.image ? post.image.split(',') : [];
          return post;
        });
      } catch (error) {
        console.error('获取朋友圈数据失败:', error);
        if (error.response?.status === 401) {
          this.$message.error('登录已过期，请重新登录');
          this.$router.push('/login');
        } else {
          this.$message.error('获取帖子失败: ' + error.message);
        }
      }
    },

    /**
     * 显示评论更多选项
     * @param {number} commentID - 评论ID
     */
    showMore(commentID) {
      this.selectedCommentId = this.selectedCommentId === commentID ? -1 : commentID;
    },

    /**
     * 显示作者信息
     * @param {number} authorId - 作者ID
     */
    async showAuthorInfo(authorId) {
      try {
        const response = await axios.get(`/api/users/${authorId}`);
        if (response.data.code === 222) {
          this.currentAuthor = response.data.obj;
          this.authorDialogVisible = true;
        } else {
          this.$message.error('获取用户信息失败');
        }
      } catch (error) {
        console.error('获取发布者信息失败:', error);
        this.$message.error('获取发布者信息失败');
      }
    },

    // ==================== 背景图片上传相关方法 ====================
    async handleBackgroundUpload(file) {
      console.log('开始处理背景图片上传...');
      
      // 1. 上传前验证
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        console.log('文件类型验证失败：不是图片文件');
        this.$message.error('只能上传图片文件!');
        return false;
      }
      if (!isLt2M) {
        console.log('文件大小验证失败：超过2MB');
        this.$message.error('图片大小不能超过 2MB!');
        return false;
      }

      try {
        // 2. 上传文件
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios({
          method: 'post',
          url: '/api/upload/background',
          data: formData,
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('login_info')).token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('背景图片上传响应:', response.data);

        if (response.data.code === 222) {
          this.$message.success('背景图片上传成功');
          
          // 3. 更新用户信息
          const loginInfo = JSON.parse(localStorage.getItem('login_info'));
          const backgroundImagePath = response.data.obj;
          
          // 更新用户信息到数据库
          const updateResponse = await axios({
            method: 'put',
            url: '/api/users/update',
            data: {
              userId: this.user.userId,
              backgroundImage: backgroundImagePath
            },
            headers: {
              'Authorization': `Bearer ${loginInfo.token}`
            }
          });

          if (updateResponse.data.code === 222) {
            // 更新本地用户信息和存储
            const newBackgroundImage = `http://localhost:3001${backgroundImagePath}`;
            
            // 更新组件状态
            this.user = {
              ...this.user,
              backgroundImage: newBackgroundImage
            };
            
            // 更新本地存储
            if (loginInfo) {
              loginInfo.backgroundImagePath = newBackgroundImage;
              localStorage.setItem('login_info', JSON.stringify(loginInfo));
            }
            
            // 重新加载用户信息以确保数据一致性
            await this.loadUserInfoAndBackgroundImage();
            
            console.log('背景图片更新完成，新路径:', newBackgroundImage);
          } else {
            console.error('更新用户背景图片失败:', updateResponse.data.msg);
            this.$message.error('更新背景图片失败，请稍后重试');
          }
        } else {
          console.error('上传失败:', response.data.msg);
          this.$message.error(response.data.msg || '上传失败');
        }
      } catch (error) {
        console.error('背景图片上传或更新失败:', error);
        this.$message.error('背景图片上传失败，请稍后重试');
      }
    },

    editNickname() {
      this.editUserInfo('nickname');
    },

    editSignature() {
      this.editUserInfo('signature');
    },

    toggleSidebar() {
      // Implementation of toggleSidebar method
    },

    // ==================== 评论相关方法 ====================
    async handleComment(post, action, comment = null) {
      console.log(`处理评论操作: ${action}`, { post, comment });
      
      try {
        const loginInfo = JSON.parse(localStorage.getItem('login_info'));
        const userID = JSON.parse(sessionStorage.getItem('userID'));

        if (!loginInfo?.token) {
          this.$message.error('请先登录');
          this.$router.push('/login');
          return;
        }

        switch (action) {
          case 'show':
            post.showCommentInput = !post.showCommentInput;
            if (post.showCommentInput) {
              this.$nextTick(() => {
                const commentInput = this.$refs.friendCircle.$el.querySelector('.comment-input');
                commentInput?.focus();
              });
            }
            break;

          case 'send':
            if (!this.newComment) {
              this.$message.error('评论内容不能为空');
              return;
            }
            if (this.newComment.length >= 50) {
              this.$message.warning('评论内容不能超过50字');
              return;
            }

            const response = await axios({
              method: 'post',
              url: '/api/comments',
              data: {
                userID,
                postID: post.postID,
                content: this.newComment,
                parentCommentID: this.replyingToCommentID
              },
              headers: {
                'Authorization': `Bearer ${loginInfo.token}`
              }
            });

            if (response.data.code === 222) {
              await this.upDateComment();
              this.$message.success('评论成功');
              post.showCommentInput = false;
              this.newComment = '';
              this.replyingToCommentID = null;
            }
            break;

          case 'delete':
            if (post.author.userId !== this.user.userId) {
              this.$message.error('只能删除自己帖子中的评论');
              return;
            }

            const deleteResponse = await axios({
              method: 'delete',
              url: `/api/comments/${comment.commentID}`,
              headers: {
                'Authorization': `Bearer ${loginInfo.token}`
              }
            });

            if (deleteResponse.data.code === 222) {
              await this.upDateComment();
              this.$message.success('删除成功');
            }
            break;

          case 'reply':
            const { value: replyContent } = await this.$prompt(
              `回复 ${comment.nickname} 的评论`,
              '回复评论',
              {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPlaceholder: '请输入回复内容'
              }
            );

            if (replyContent) {
              const replyResponse = await axios({
                method: 'post',
                url: '/api/comments',
                data: {
                  userID,
                  postID: post.postID,
                  content: replyContent,
                  parentCommentID: comment.commentID
                },
                headers: {
                  'Authorization': `Bearer ${loginInfo.token}`
                }
              });

              if (replyResponse.data.code === 222) {
                await this.upDateComment();
                this.$message.success('回复成功');
              }
            }
            break;

          case 'copy':
            await navigator.clipboard.writeText(comment.content);
            this.$message.success('已复制评论');
            this.selectedCommentId = -1;
            break;
        }
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消操作');
        } else {
          console.error('操作失败:', error);
          if (error.response?.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error('操作失败，请稍后重试');
          }
        }
      }
    },

    // ==================== 帖子相关方法 ====================
    async handlePost(post, action) {
      console.log(`处理帖子操作: ${action}`, { post });
      
      try {
        const loginInfo = JSON.parse(localStorage.getItem('login_info'));
        
        if (!loginInfo?.token) {
          this.$message.error('请先登录');
          this.$router.push('/login');
          return;
        }

        if (post.author.userId !== this.user.userId) {
          this.$message.error('只能操作自己的帖子');
          return;
        }

        switch (action) {
          case 'edit':
            // 初始化编辑状态
            this.editingPost = {
              postID: post.postID,
              content: post.content,
              images: post.images || []
            };
            this.editDialogVisible = true;
            break;

          case 'delete':
            const deleteResponse = await axios({
              method: 'delete',
              url: `/api/posts/${post.postID}`,
              headers: {
                'Authorization': `Bearer ${loginInfo.token}`
              }
            });

            if (deleteResponse.data.code === 222) {
              await this.getAll();
              await this.upDateComment();
              this.$message.success('删除成功');
            }
            break;
        }
      } catch (error) {
        if (error === 'cancel') {
          this.$message.info('已取消操作');
        } else {
          console.error('操作失败:', error);
          if (error.response?.status === 401) {
            this.$message.error('登录已过期，请重新登录');
            this.$router.push('/login');
          } else {
            this.$message.error('操作失败，请稍后重试');
          }
        }
      }
    },

    /**
     * 处理头像上传
     * @param {File} file - 上传的文件
     * @returns {boolean} - 是否继续上传
     */
    async handleAvatarUpload(file) {
      console.log('开始处理头像上传...');
      
      // 1. 上传前验证
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        console.log('文件类型验证失败：不是图片文件');
        this.$message.error('只能上传图片文件!');
        return false;
      }
      if (!isLt2M) {
        console.log('文件大小验证失败：超过2MB');
        this.$message.error('图片大小不能超过 2MB!');
        return false;
      }

      try {
        // 2. 上传文件
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios({
          method: 'post',
          url: '/api/upload/avatar',
          data: formData,
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('login_info')).token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('头像上传响应:', response.data);

        if (response.data.code === 222) {
          this.$message.success('头像上传成功');
          
          // 更新用户信息到数据库
          const loginInfo = JSON.parse(localStorage.getItem('login_info'));
          const updateResponse = await axios({
            method: 'put',
            url: '/api/users/update',
            data: {
              userId: this.user.userId,
              avatar: response.data.obj
            },
            headers: {
              'Authorization': `Bearer ${loginInfo.token}`
            }
          });

          if (updateResponse.data.code === 222) {
            // 更新组件的 user 数据
            this.user.avatar = response.data.obj;
            
            // 更新本地存储
            if (loginInfo) {
              loginInfo.avatar = response.data.obj;
              localStorage.setItem('login_info', JSON.stringify(loginInfo));
            }
            
            // 重新加载用户信息
            await this.loadUserInfoAndBackgroundImage();
            
            // 刷新帖子列表以更新头像
            await this.getAll();
            
            console.log('头像更新完成，新的完整路径:', response.data.obj);
          } else {
            console.error('更新用户头像失败:', updateResponse.data.msg);
            this.$message.error('更新头像失败，请稍后重试');
          }
        } else {
          console.error('上传失败:', response.data.msg);
          this.$message.error(response.data.msg || '上传失败');
        }
      } catch (error) {
        console.error('头像上传或更新失败:', error);
        this.$message.error('头像上传失败，请稍后重试');
      }
    },

    // 处理图片上传
    handleImageUpload(file) {
      const isImage = file.type.startsWith('image/');
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return false;
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!');
        return false;
      }
      return true;
    },

    // 处理上传成功
    handleUploadSuccess(response) {
      if (response.code === 222) {
        this.editingPost.images.push(response.obj);
        this.$message.success('图片上传成功');
      } else {
        this.$message.error(response.msg || '上传失败');
      }
    },

    // 处理上传失败
    handleUploadError() {
      this.$message.error('图片上传失败，请重试');
    },

    // 删除图片
    removeImage(index) {
      this.editingPost.images.splice(index, 1);
    },

    // 提交编辑
    async submitEdit() {
      try {
        const loginInfo = JSON.parse(localStorage.getItem('login_info'));
        
        if (!this.editingPost.content.trim()) {
          this.$message.error('内容不能为空');
          return;
        }

        const response = await axios({
          method: 'put',
          url: `/api/posts/${this.editingPost.postID}`,
          data: {
            content: this.editingPost.content,
            image: this.editingPost.images.join(',')
          },
          headers: {
            'Authorization': `Bearer ${loginInfo.token}`
          }
        });

        if (response.data.code === 222) {
          this.$message.success('编辑成功');
          this.editDialogVisible = false;
          await this.getAll();
          await this.upDateComment();
        } else {
          this.$message.error(response.data.msg || '编辑失败');
        }
      } catch (error) {
        console.error('编辑失败:', error);
        this.$message.error('编辑失败，请稍后重试');
      }
    },
  }
};
</script>

<style scoped>
.container {
  max-width: 100%;
  margin: 0 auto;
  min-height: 80%;
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  background-color: white;
}

.moreMenu {
  display: block;
  width: 60px;
  height: 64px;
  position: absolute;
  background-color: #f3f3f5;
  right: 30px;
  border-radius: 5px;
  /* 设置投影的颜色 */
  box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.2);
}

.moreMenu p {
  font-size: 16px;
  line-height: 20px;
  margin: 0 auto;
  color: #000;
  text-align: center;
  border: 1px solid #fff;
}

div.top {
  height: 332px;
}

#goTop {
  position: fixed;
  bottom: 10px;
  right: 10px;
  cursor: pointer;
  color: #fff;
  background: deepskyblue;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 16px;
  z-index: 1000;
}

.background {
  padding: 150px;
  background-size: cover;
  display: block;
  height: 100%;
}

.user-info {
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(50%, 35%);
  text-align: right;
}

.sidebar-trigger {
  position: absolute;
  top: 10px;
  /* 调整上边距 */
  left: 10px;
  /* 调整左边距 */
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  z-index: 1001;
  /* Make sure it is above the sidebar */
}

/* 侧边菜单栏样式 */
.sidebar-drawer {
  height: 100%;
  z-index: 999;
  /* 确保侧边栏在顶层 */
  overflow-y: auto;
  background-color: #090723;
}

.sidebar-drawer img.userImg {
  display: block;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto;
  border: 4px solid #fff;
}

.sidebar-drawer img.userImg:hover {
  border: 4px solid skyblue;
}

.sidebar-drawer span {
  display: block;
  margin-top: 10px;
  width: 100%;
  text-align: center;
}

.camera-icon {
  position: absolute;
  top: -80px;
  right: -80px;
  cursor: pointer;
  /* 调整相机图标大小，可以根据需要设置宽高 */
  /* 或者使用 transform 缩小图标 */
  transform: scale(0.15);
}

.user-avatar {
  width: 60px;
  height: 60px;
  margin-right: 52px;
  margin-top: 16px;
  border: 3px solid #fff;
  /* 添加边框 */
}

.user-nickname {
  margin-left: -140px;
  color: #000;
  font-size: 20px;
  font-weight: bold;
  padding-right: 12px;
}

img.post-avatar {
  margin-left: 10px;
  transform: rotate(0deg);
  transition: transform 0.5s ease-in-out;
}

img.post-avatar:hover {
  transform: rotate(180deg);
  transition: transform 0.5s ease-in-out;
}

.background-image-container {
  background-size: cover;
  background-position: center;
  /* 或者调整为你希望的位置 */
  background-repeat: no-repeat;
  background-color: #fff;
  /* 背景色，防止背景图片不完整时显示为黑色 */
  width: 100%;
  /* 背景图片容器宽度为100% */
  height: 100vh;
  /* 背景图片容器高度为100%视口高度 */
}

.friend-circle {
  margin-top: 0px;
}

.post {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.post-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-avatar:hover {
  transform: scale(1.1);
}

.post-nickname {
  margin-left: 10px;
  color: #546993;
  max-width: 300px;
  font-size: 18px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 30px;
  cursor: pointer;
  display: inline-block;
}

.post-nickname:hover {
  color: #409EFF;
}

.post-content {
  color: #090909;
  font-size: 20px;
  font-weight: bold;
}

.post-image {
  max-width: 30%;
  margin: 2px;
  margin-top: 10px;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.post-footer .left {
  flex: 1;
}

.post-footer .right {
  margin-left: 20px;
}

.post-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.post-time {
  color: #959595;
  font-size: 12px;
  font-weight: bold;
}

.post-address {
  color: #959595;
  font-size: 12px;
  font-weight: bold;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-actions button {
  margin-left: 0;
}

.post-comments {
  margin-top: 70px;
  background-color: #f3f3f5;
}

.post-likes,
.post-comments-list {
  margin-top: 5px;
  color: #546993;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  line-height: 20px;
}

.post-comment {
  margin-top: 5px;
  color: #090909;
  border-top: 1px solid #e5e5e5;
  padding: 8px 0;
}

.main-comment {
  margin-bottom: 5px;
}

.reply-comments {
  margin-left: 20px;
  padding-left: 10px;
  border-left: 2px solid #e5e5e5;
}

.reply-comment {
  margin-top: 5px;
  font-size: 14px;
  color: #666;
  padding: 4px 0;
}

.reply-to {
  color: #999;
  margin: 0 4px;
}

.comment-author {
  font-weight: bold;
  color: #546993;
}

.comment-input {
  margin-top: 10px;
  width: calc(100% - 80px);
  /* 调整输入框宽度，留出按钮的宽度 */
  border-radius: 5px;
  outline: none;
  float: left;
  /* 将输入框浮动到左边 */
}

.comment-submit {
  margin-top: 10px;
  margin-left: 10px;
  float: left;
  /* 将按钮浮动到左边 */
}

.left-menu {
  height: 100%;
  width: 30%;
  background-color: white;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow-y: auto;
  border-right: 1px solid #e6e6e6;
}

.bottom {
  height: 100%;
  margin: 0;
  margin-left: 30%;
  width: 70%;
}

.nickname-container {
  display: flex;
  flex-direction: column;
  /* 子元素垂直排列 */
  align-items: center;
  /* 子元素水平居中 */
  text-align: center;
  /* 文本居中 */
}

.userImg {
  /* 设置头像的大小，可以根据需要调整 */
  width: 100px;
  height: 100px;
  border-radius: 50%;
  /* 圆形头像 */
  margin-bottom: 10px;
  /* 头像和昵称之间的间距 */
  margin-top: 10px;
}

.nickname {
  font-size: 30px;
  /* 设置字体大小为 20 像素 */
}
.post-actions{
  display: flex;
align-items: center;
}
.post-actions button{
margin-left: 10px; /* 可选：添加一些间距 */}

.user-info-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.background-image-preview {
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
  margin-bottom: 20px;
  border-radius: 8px;
}

.background-uploader {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.avatar-container {
  margin-top: -60px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.user-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.info-container {
  width: 100%;
  max-width: 400px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.info-item .label {
  width: 80px;
  color: #606266;
  font-weight: bold;
}

.info-item .value {
  flex: 1;
  color: #303133;
  margin-right: 10px;
}

.signature {
  font-style: italic;
  color: #666;
}

.signature .value {
  color: #666;
  font-style: italic;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.el-dialog {
  border-radius: 8px;
  overflow: hidden;
}

.el-dialog__header {
  background-color: #f5f7fa;
  padding: 15px 20px;
  margin: 0;
}

.el-dialog__title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.el-dialog__body {
  padding: 20px;
}

.el-dialog__footer {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
}

/* Font Awesome 图标样式 */
.fa-heart {
  color: #ff4d4f;
  cursor: pointer;
  font-size: 18px;
  margin-right: 10px;
}

.fa-heart-o {
  color: #999;
  cursor: pointer;
  font-size: 18px;
  margin-right: 10px;
}

.fa-heart:hover, .fa-heart-o:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* 图片预览相关样式 */
.image-preview-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.9);
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.post-image {
  max-width: 30%;
  margin: 2px;
  margin-top: 10px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.05);
}

/* 头像上传相关样式 */
.avatar-container {
  margin-top: -60px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.user-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.avatar-uploader {
  position: absolute;
  bottom: 0;
  right: 0;
}

.avatar-upload-button {
  margin-top: 10px;
}

.edit-post-container {
  padding: 20px;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
}

.image-preview-item {
  position: relative;
  width: 150px;
  height: 150px;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.delete-image-btn {
  position: absolute;
  top: 5px;
  right: 5px;
}

.upload-container {
  margin-top: 10px;
}
</style>
