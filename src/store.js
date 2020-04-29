import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'
import axios from "axios"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {  // 컴포넌트 간에 공유할 data
    isLogin: false,
    isLoginError: false,
    userInfo: null
  },
  mutations: { // state의 변화를 일으키는 곳

    // 로그인이 성공했을 때
    loginSuccess(state, payload) {
      state.isLogin = true
      state.isLoginError = false
      state.userInfo = payload
    },

    // 로그인이 실패했을 때
    loginError(state) {
      state.isLogin = false
      state.isLoginError = true
    },

    // 로그아웃
    logout(state) {
      localStorage.removeItem("accessToken") // token 삭제
      state.isLogin = false
      state.isLoginError = false
      state.userInfo = null
    }

  },
  actions: { // 비즈니스 로직
    // 로그인 시도
    doLogin({ dispatch }, loginObj) {
      // 전체 유저에서 해당 이메일로 유저를 찾는다.
      axios.post("http://localhost:9002/login", loginObj)
        .then(res => {
          alert("로그인에 성공했습니다.")
          // 성공 시 토큰을 헤더에 포함시켜서 유저정보 요청          
          localStorage.setItem("accessToken", res.data.accessToken)
          dispatch("getMemberInfo")
        })
        .catch(err => {
          alert('이메일 또는 비밀번호를 확인하세요.')
          // commit("loginError")
          console.log(err)
        })
    },

    // 로그아웃 시도
    doLogout({ commit }) {
      commit("logout")
      router.push({ name: "home" })
    },

    // 유저정보 요청
    getMemberInfo({ commit }) {
      let token = localStorage.getItem("accessToken")
      if (token != null) {

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        
        const bodyParameters = {
            key: "value"
        };
        axios
          .post("http://localhost:9306/loginUser", bodyParameters, config)
          .then(response => {            
              let userInfo = {
                name: response.data.name,
                email: response.data.email,
                phone: response.data.phone,
                address: response.data.address,
                level: response.data.level,
                active: response.data.active,
              }

              commit("loginSuccess", userInfo)
              router.push({ name: "mypage" })
            })
          .catch(error => {
            alert('유저정보를 가져올 수 없습니다.')
            console.log(error)
          })
      }
    }
  }
})