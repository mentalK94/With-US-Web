<template>
<div class="qna-section">
    <!-- 상품문의 header -->
    <div class="qna-header">
        <h4>상품문의( <strong>{{ qnas.length }}</strong> )</h4>
    </div>
    <hr class="qna-hr">
    <div class="review-header-message">
        <p>* 상품과 관계없는 글, 양도, 광고성, 욕설, 비방, 도배 등의 글은 예고없이 삭제됩니다.</p>
    </div>
    <div class="qna-textarea">
        <textarea class="form-control" v-model="question" name="question" rows="4" 
        cols="80" placeholder="상품에 대해 궁금한 점을 물어보세요." @click="loginCheck()"></textarea>
        <button type="button" class="write-question-btn" v-on:click="writeQuestion()">등록하기</button>
    </div>

    <div v-for="qna in qnas" :key="qna.id" class="qna-list">
        <div class="qna-list-box">
            <div class="qna-contents-header">
                 <div class="qna-contents-header-msg">{{ qna.questionWriter }}  {{ qna.questionRegisterDate }}</div>
            </div>
            <div class="qna-question">
                {{ qna.question }}
            </div>
            <div class="qna-contents-footer">
                <button v-bind:id="'answer-btn-'+qna.id" v-if="qna.answer === null" type="button" class="answer-btn" @click="displayAnswerTextArea(qna.id)">답변하기</button>
                <button v-bind:id="'answer-btn-'+qna.id" v-if="qna.answer !== null" type="button" class="answer-btn" @click="displayAnswer(qna.id)">답변보기</button>
            </div>
            <div v-bind:id="'qna-answer-'+qna.id" class="qna-answer">
                <h4>{{ qna.answerWriter }} | {{ qna.answerRegisterDate }}</h4>
                <span>{{ qna.answer }}</span>
            </div>
            <div v-bind:id="'answer-textarea-'+qna.id" class="answer-textarea">
                <textarea class="form-control" v-model="answer" name="answer" rows="4" 
                cols="80" @click="loginCheck()"></textarea>
                <button type="button" class="write-answer-btn" v-on:click="writeAnswer(qna.id)">등록하기</button>
            </div>
        </div>
        <hr>
    </div>
</div>
</template>
<script>
import axios from "axios"
import router from "../../../router"
import {mapState} from "vuex"

export default {
    props: ['productId'],
    data() {
        return {
            loading: true, 
            qnas: [],
            question: "",
            answer: "",
        }
    },
    computed: {
      ...mapState(["isLogin"]),
    },
    created () {
        this.getQnas()
    },
    watch: {
        '$route': 'getQnas',
        '$route': 'replaceWriter'
    },
    methods: {
        // 상품 문의정보 요청
        getQnas() {
            axios
            .get("http://localhost:9306/questionAnswers/"+this.$route.params.id)
            .then(response => {
                this.loading = false
                this.qnas = response.data
                this.replaceWriter()
                this.$emit('qna-count', this.qnas.length)
            })
            .catch(error => {
                alert('서버 오류')
                console.log(error)
            })
        },
        displayAnswer(qnaId) {
            
            var display = document.getElementById('qna-answer-'+qnaId).style.display
            if(display === "none") {
                document.getElementById('answer-btn-'+qnaId).style.color = "#7c6beb"
                document.getElementById('qna-answer-'+qnaId).style.display = "inline-block"
            } else {
                document.getElementById('answer-btn-'+qnaId).style.color = "black"
                document.getElementById('qna-answer-'+qnaId).style.display = "none"
            }
        },
        displayAnswerTextArea(qnaId) {
            
            var display = document.getElementById('answer-textarea-'+qnaId).style.display
            if(display === "none") {
                document.getElementById('answer-textarea-'+qnaId).style.display = "inline-block"
            } else {
                document.getElementById('answer-textarea-'+qnaId).style.display = "none"
            }
        },
        writeQuestion() { // 문의 작성 기능
            if(this.question.length < 10) {
                alert("최소 10자 이상 입력해주세요. ")
                return
            } 

            let token = localStorage.getItem("accessToken")

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const bodyParameters = {
                productId: this.$props.productId,
                question: this.question
            };

            axios
            .post("http://localhost:9306/write/question", bodyParameters, config)
            .then(response => {
                this.getQnas()
                this.question = ""
            })
            .catch(error => {
                alert('서버 오류')
                console.log(error)
            })
        },
        writeAnswer(qnaId) { // 답변 작성 기능
            if(this.answer.length < 10) {
                alert("최소 10자 이상 입력해주세요. ")
                return
            } 

            let token = localStorage.getItem("accessToken")

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const bodyParameters = {
                id: qnaId,
                answer: this.answer
            };

            axios
            .post("http://localhost:9306/write/answer", bodyParameters, config)
            .then(response => {
                this.getQnas()
                this.answer = ""
                document.getElementById('answer-textarea-'+qnaId).style.display = "none"
            })
            .catch(error => {
                alert('서버 오류')
                console.log(error)
            })
        },
        replaceWriter() {  // 작성자 데이터 치환 : 김한솔 -> 김*솔로 변경
            var replaceChar = '*'
            var position = 2 // 2번째 문자 *으로 치환

            for(var i=0; i<this.qnas.length; i++) {
                this.qnas[i].questionWriter = this.qnas[i].questionWriter.substring(0, position-1) 
                + replaceChar + this.qnas[i].questionWriter.substring(position, this.qnas[i].questionWriter.length)
            }
        },
        loginCheck() {
            if(this.isLogin === false) {
                router.push({ name: "login" })
            }
        }
    }    
}
</script>
<style scoped>
.qna-section {
    width: 100%;    
}

.qna-header h4{
    font-weight: bold;
    font-size: 100%;
}

.qna-header strong{
    color: #7c6beb;
    font-size: 120%;
}

.qna-hr {
    margin: 2% 0% 2% 0%;
}

.qna-textarea {
    box-sizing: border-box;
    position: relative;
    width: 85%;
    margin-bottom: 15%;
}

.qna-textarea textarea{
    resize: none;
    float: left;
    height: 100px;
    border-radius: 0%;
}

.answer-textarea {
    box-sizing: border-box;
    position: relative;
    width: 85%;
    margin: 2%;
    display: none;
}

.answer-textarea textarea{
    resize: none;
    float: left;
    height: 100px;
    border-radius: 0%;
}

.write-answer-btn {
    position: absolute;
    width: 120px;
    height: 100px;
    font-size: 100%;
    border-left: 0;
    border: solid 1px #b7bfc8;
    background-color:white;
    cursor: pointer;    
}

.write-question-btn {
    position: absolute;
    width: 120px;
    height: 100px;
    font-size: 100%;
    border-left: 0;
    border: solid 1px #b7bfc8;
    background-color:white;
    cursor: pointer;    
}

.qna-list {
    margin: 2% 2% 2% 2%;
    position: relative;
    width: 90%;
}

.qna-contents-header {
    margin-top: 2%;
    margin-bottom: 3%;
    color: #CCC;
    font-size: 75%;
}

.qna-question{
    min-height: 80px;
    font-size: 90%;
}

.qna-contents-footer {
    font-size: 80%;
}

.qna-contents-header-msg{
    margin-right: 2%;
}

.answer-btn {
    border: 0;
    background-color: #f8f8f8;
    cursor: pointer;
    outline: 0;
}

.answer-btn-clicked {
    color: #7c6beb;
}

.qna-answer {
    margin: 2% 2% 2% 5%;
    width: 90%;
    min-height: 150px;
    padding: 2%;
    background-color:#efefef;
    display: none;
    white-space:pre;
}

.qna-answer h4 {
    font-size: 75%;
    color: #7d7e80;
    margin-bottom: 3%;
}

.qna-answer span{
    font-size: 80%;
    color: #7d7e80;
}
</style>