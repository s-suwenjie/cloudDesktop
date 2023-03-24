<template>
	<div id="app">
		<!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/> -->
		<el-dialog title="设置(双击数据可进行修改)" :visible.sync="dialogFormVisible" :close-on-click-modal="false" width="80%">

			<el-tabs type="border-card" @tab-click="getFolderImgList">
				<el-tab-pane label="桌面配置" style="height: 500px;">
					<div class="setUpMain">
						<el-table
								:data="tableData"
								border
								stripe
								style="width: 100%"
								@cell-dblclick="popUpOpen"
								max-height="500">
							<el-table-column
									fixed
									prop="name"
									label="名称"
									width="130">
							</el-table-column>
							<el-table-column
									fixed
									prop="key"
									label="程序key"
									width="130">
							</el-table-column>
							<el-table-column
									prop="url"
									label="图标地址"
							>
							</el-table-column>
							<el-table-column
									prop="path"
									label="路径"
							>
							</el-table-column>
						</el-table>
					</div>

				</el-tab-pane>

				<el-tab-pane label="背景设置" style="height: 500px;overflow-y: auto;">
					<div class="imgBgBox">
						<img :src="item" style="cursor: pointer;margin-bottom: 20px;" width="200" height="200" @click="clickBgImg(item)" v-for="(item,index) in imgList" :key="index" alt="">
					</div>
				</el-tab-pane>

			</el-tabs>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" @click="clickDesktop">返回windows桌面</el-button>
				<!--				<el-button type="primary" @click="formConfig,dialogFormVisible = false">确 定</el-button>-->
			</div>
		</el-dialog>
		<div class="main" ref="mainBgImg">
			<div class="setUp" @click="setUp" ref="refSetUp"></div>
			<div class="mainBox">
				<div class="mainItem" v-for="(item,index) in this.tableData" @click="clickWebsocket(item)">
					<div class="mainItemCenter" :style="{'backgroundColor':backgroundColorList[index]}">
						<img width="48" height="48"
							:src="item.url"
							:alt="item.name">
						<span>
							{{item.name}}
						</span>
					</div>
				</div>
			</div>
			<div v-if="clickWindowsMenu" class="mask" @click="clickWindowsMenu=false"></div>
			<div class="taskbar" v-if="!loading">
				<div class="taskbarLeft">
					<div class="taskbarItem" ref="windowsBtn" style="position: relative;">
						<img width="36" height="36" :class="{'windowsSvg':clickWindows}" src="./img/windows.svg" title="菜单" alt="菜单" @click="clickWindowsIcon">
					</div>
					<div class="taskbarItem" v-for="(item,index) in list">
						<img width="32" height="32" :src="item.local.url+''" alt="" @click="switchExe(item,index)">
						<div class="previewItem">
							<div class="previewItemBox" style="float: left;position: relative;" v-for="(items,indexs) in item.count">
								<div class="closeSvg" @click="closeExe(item,indexs)"></div>
								<div class="itemMainBox" @click="switchExe(item,indexs)">
									<img width="24" height="24" :src="item.local.url" alt="">
									<span style="margin-left: 10px;">{{item.local.name}}</span>
								</div>
								<img @click="switchExe(item,indexs)" style="position: absolute;top: 60%;height: 50%;transform: translate(-50%,-50%)" :src="item.local.url" alt="">
							</div>
						</div>
					</div>
				</div>

				<div style="width: 200px;height: 100%;padding: 6px 0;box-sizing: border-box;font-size: 14px;">
					<p style="margin: 0;height: 18px;line-height: 18px;text-align: right;">{{date.date2}}</p>
					<p style="margin: 0;height: 18px;line-height: 18px;text-align: right;">{{date.date}}</p>
				</div>
			</div>
			<div class="menuMain" :class="{'menuMainHide':clickWindowsMenu}"  ref="menuMain">
				<div class="menuMainItem" @click="windowsMenuClick(index+1)" v-for="(item,index) in windowsMenuList" :key="index">
					{{item}}
				</div>
			</div>
		</div>
		<div class="mask" v-if="loading">
			<div class="loadingBox">
				<div class="loading"></div>
				<div style="color: #fff;margin-top: 20px;">{{loadingText}}<span class="loadingSpot">...</span></div>
			</div>

		</div>
	</div>
</template>
<script>
	import axios from 'axios'
	export default {
		name: 'app',
		data() {
			return {
				date:{},
				list: [],
				imgList: [],//获得的全部img图片
				implement:true,//节流判断值
				url:process.env.NODE_ENV === "development"?'./public':window.process.resourcesPath,//判断线上线下
				igmUrl:process.env.NODE_ENV === "development"?'./img/':'./img/',//判断线上线下背景图片文件夹
				loading:true,
				loadingText:'正在启动后台服务',
				windowsMenuList:['关机','重启'],//windows图标的功能菜单
				clickWindows:false,//左下角图标动画
				clickWindowsMenu:false,
				backgroundColorList:['#70BAFC','#FED16F','#28D7C3','#A1E59D','#FED16F','#BC80E5','#10D1BB','#C28DE8','#7FC1FC'],
				errorList:[],//统计连接断开的次数
				setUpIndex:0,//点击设置的次数 累计一定次数打开设置框

				dialogFormVisible: false,
				tableData: [
						{
					name: 'IDEA',
					key: 'IntelliJ IDEA',
					url: './img/1.png',
					width: '48',
					height: '48',
					path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
				}, {
					name: '谷歌浏览器',
					key: 'Vivaldi',
					url: './img/windows.svg',
					width: '48',
					height: '48',
					path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
				}, {
					name: 'XXX应用程序',
					key: '1111111',
					url: './img/1.png',
					width: '48',
					height: '48',
					path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
				}, {
					name: 'XXX应用程序',
					key: '22222222',
					url: './img/2.png',
					width: '48',
					height: '48',
					path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
				}, {
					name: 'XXX应用程序',
					key: '333333333',
					url: './img/1.png',
					width: '48',
					height: '48',
					path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
				}
				, {
					name: 'XXX应用程序',
					key: '444444444',
					url: './img/2.png',
					width: '48',
					height: '48',
					path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
				}, {
					name: 'XXX应用程序',
					key: '55555555',
					url: './img/1.png',
					width: '48',
					height: '48',
					path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
				}, {
					name: 'XXX应用程序',
					key: '6666666',
					url: './img/2.png',
					width: '48',
					height: '48',
					path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
				}, {
					name: 'XXX应用程序',
					key: '7777777777',
					url: './img/1.png',
					width: '48',
					height: '48',
					path: 'D:\\Vivaldi\\Application\\vivaldi.exe',
				}
				]
			}
		},
		mounted() {
			// console.log(`//${location.host}/WebSocket/WebSocket`)
			setInterval(()=>{//获取当前时间和日期
				this.date = this.getDate()
			},1000)
			console.log(localStorage.getItem('bgImgPath'),'localStorage.getItem(\'bgImgPath\')')
			if(localStorage.getItem('bgImgPath')!=null){
				this.clickBgImg(localStorage.getItem('bgImgPath'),1)
			}else{
				this.$refs.mainBgImg.style.background='url(./img/默认背景图.jpeg)';
				this.$refs.mainBgImg.style.backgroundSize='100% 100%';
			}
			this.initWebSocket();
			// 点击其他区域关闭自定义div
			document.addEventListener('click', (e) => {
				try {
					// 点击 menuMain  并且 点击的不是筛选按钮 ，就关闭菜单
					if (!this.$refs.menuMain.contains(e.target) && !this.$refs.windowsBtn.contains(e.target) ) {
						this.clickWindowsMenu = false
						// console.log('点击了其它区域')
					}
					// 如果点击的不是调起设置框的位置 则清空调起设置框的累计数值
					if (!this.$refs.refSetUp.contains(e.target)) {
						this.setUpIndex=0
						// console.log('点击了其它区域,',this.setUpIndex)
					}
				}catch (e) {
					console.log(e)
				}
			});
		},
		sockets: {
			// 连接成功
			onopen() {
				this.loading = false
				this.errorList = []
				axios.post('http://localhost:8089/switch/getLocal', {})
						.then((res) => {
							this.tableData = res.data.params
						})
						.catch((error) => {
							console.log(error)
						})
				console.log("socket success");
			},
			// 接收消息
			onmessage(e) {
				if(JSON.parse(e.data).code==200){
					let list = JSON.parse(e.data).params
					this.list = list
				}
			},
			// 连接报错
			onerror() {
				this.loading = true
				console.log('连接出错')
				this.errorList.push('连接出错')
				this.loadingText = '服务器连接失败,正在尝试重连'+this.errorList.length+'/5次'
				if(this.errorList.length>=6){
					this.loadingText = '服务器未响应,正在尝试重启后台服务'
					this.init()
					this.initWebSocket()
				}
			},
			// 关闭连接
			onclose() {
				this.loading = true
				console.log("socket close");
			},
		},
		destroyed() {
			// 销毁websocket
			this.$disconnect();
			// this.getFolderImgList()
		},
		created() {
			this.init()
			this.base()
		},
		methods: {
			clickBgImg(item,type){
				this.$refs.mainBgImg.style.background='url('+item+')';
				this.$refs.mainBgImg.style.backgroundSize='100% 100%';
				if(type!=1){
					this.$message({
						message: '切换成功',
						type: 'success'
					});
					localStorage.setItem('bgImgPath',item)
				}
			},
			readFileList(path, filesList) {
				const fs = window.require('fs');
				let that = this
				let files = fs.readdirSync(path);
				files.forEach(function (itm, index) {
					let stat = fs.statSync(path + itm);
					if (stat.isDirectory()) {
						//递归读取文件
						that.readFileList(path + itm + "/", filesList)
					} else {
						let obj = {};//定义一个对象存放文件的路径和名字
						obj.path = path;//路径
						obj.filename = itm//名字
						filesList.push(obj);
					}
				})
			},
			getImageType(str){
				console.log(str,'str')
				var reg = /\.(png|jpg|gif|jpeg|webp)$/;
				return str.match(reg)[1];
			},
			base(){
				let that = this
				const image = require("imageinfo"); //引用imageinfo模块
				const fs = window.require('fs');
				let getFiles = {
					//获取文件夹下的所有文件
					getFileList: function (path) {
						let filesList = [];
						that.readFileList(path, filesList);
						console.log(filesList,'filesList')
						return filesList;
					},
					//获取文件夹下的所有图片
					getImageFiles: function (path) {
						let imageList = [];
						getFiles.getFileList(path).forEach((item) => {
							let ms = image(fs.readFileSync(item.path + item.filename));
							ms.mimeType && (imageList.push('./public/img2/' + item.filename))
						});
						return imageList;
					}
				};
				//获取文件夹下的所有图片
				let srclist=getFiles.getImageFiles(process.env.NODE_ENV === "development"?'./public/img2/':'./resources/app.asar/img/');
				let srcNewList=[];
				that.imgList =  srclist
				let srcUrl = ''
				// srclist.forEach(function (item, index){
				// 	if(item.indexOf('jpg')!=-1||item.indexOf('png')!=-1){
				// 		console.log(item.path+item.filename,'item.path+item.filename')
				// 		const buffer = new Buffer(item.path+item.filename, 'binary');
				// 		srcUrl = 'data: image/'+ this.getImageType(item.filename) +';base64,' + buffer.toString('base64');
				// 		console.log(srcUrl,'******')
				// 		srcNewList.push(item)
				// 	}
				// })
				// that.imgList =  srcNewList
				fs.readFile('C:\\Users\\Administrator\\Desktop\\cloudDesktop\\vue-electron\\public\\img2\\','binary',function(err,data){
					if(err){
						console.log(err,'111111')
					}else{
						console.log('数据读取成功');
					}
				});
			},
			getFolderImgList(){
				let that = this
				const image = require("imageinfo"); //引用imageinfo模块
				const fs = window.require('fs');
				let getFiles = {
					//获取文件夹下的所有文件
					getFileList: function (path) {
						let filesList = [];
						that.readFileList(path, filesList);
						console.log(filesList,'filesList')
						return filesList;
					},
					//获取文件夹下的所有图片
					getImageFiles: function (path) {
						let imageList = [];
						getFiles.getFileList(path).forEach((item) => {
							let ms = image(fs.readFileSync(item.path + item.filename));
							ms.mimeType && (imageList.push(that.igmUrl + item.filename))
						});
						return imageList;
					}
				};
				//获取文件夹下的所有图片
				let srclist=getFiles.getImageFiles(process.env.NODE_ENV === "development"?'./public/img/':'./resources/app.asar/img/');
				let srcNewList=[];
				that.imgList =  srclist
				srclist.forEach(function (item, index){
					if(item.indexOf('jpg')!=-1||item.indexOf('png')!=-1){
						srcNewList.push(item)
					}
				})
				that.imgList =  srcNewList
			},
			init(){
				// console.log(window.process.resourcesPath);
				let that = this
				let child_process = window.require("child_process")
				Promise.resolve().then(function() {
					child_process.execFile("1.bat",null,{cwd:that.url},function(error,stdout,stderr){
						if(error !==null){
							console.log("exec error"+error)
						}else{
							that.loadingText='正在启动后台服务'
						}
					})
				}).then(function() {
					child_process.execFile("run.bat",null,{cwd:that.url},function(error,stdout,stderr){
						if(error !==null){
							console.log("exec error3"+error)
						}else{
							console.log("成功3")
						}
					})
				})
			},
      close(){
        this.loading=true
        this.loadingText='正在重启windows任务栏服务'
        let that = this
        let child_process = window.require("child_process")
        child_process.execFile("2.bat",null,{cwd:this.url},function(error,stdout,stderr){
          if(error !==null){
            console.log("exec error"+error)
          }else{

          }
        })
        setTimeout(()=>{
          this.loadingText = '正在结束当前进程'
        },800)
        setTimeout(()=>{
          that.viewProcessMessage('electron.exe',function (msg) {
            try {
              //关闭匹配的进程
              window.process.kill(msg)
            }catch (e) {

            }
          })
        },1800)
      },
			clickDesktop(){
				this.$confirm('是否确认退出当前程序并返回windows桌面?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
          this.close()
				}).catch(() => {
					// this.$message({
					// 	type: 'info',
					// 	message: '已取消删除'
					// });
				});
			},
			getDate(){
				let nowDate = new Date();
				const weekArr = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"]
				let date = {
					year: nowDate.getFullYear(),
					month: nowDate.getMonth() + 1,
					date: nowDate.getDate(),
					hours: nowDate.getHours(),
					minutes: nowDate.getMinutes(),
					seconds: nowDate.getSeconds(),
				};      let newmonth = date.month > 10 ? date.month : "0" + date.month;
				let newday = date.date > 10 ? date.date : "0" + date.date;
				let newminutes = date.minutes < 10 ? "0" + date.minutes : date.minutes;
				let newseconds = date.seconds < 10 ? "0" + date.seconds : date.seconds;
				// console.log(weekArr[new Date().getDay()])

				let time = {
					date:date.year + "-" + newmonth + "-" + newday + '  ' +weekArr[new Date().getDay()],
					date2:date.hours + ":" + newminutes + ":" + newseconds
				}
				return time
			},
			windowsMenuClick(type){
				axios.get('http://localhost:8089/switch/shutDowRestart?type='+type
				).then((res) => {
					if (res.data.code==200){
						this.$message({
							message: '操作成功',
							type: 'success'
						});
					}
				})
				.catch((error) => {
					console.log(error)
				})
			},
			formConfig(){//更新桌面软件地址及图标数据
				axios.post('http://localhost:8089/switch/updateLocal', this.tableData
				).then((res) => {
					if (res.data.code==200){
						this.$message({
							message: '保存成功',
							type: 'success'
						});
					}
				})
				.catch((error) => {
					console.log(error)
				})
			},
			popUpOpen(row, column, cell, event) {
				let title = ''
				if(column.property=='path'){
					title = '路径'
				}else if(column.property=='url'){
					title = '图标地址'
				}else if(column.property=='key'){
					title = '程序key'
				}else{
					title = '名称'
				}
				console.log(row, column.property, cell, event,'======')
				this.$prompt('请输入'+title, '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputValue:row[column.property],
					inputPattern: /\S/,
					inputErrorMessage: title+'不能为空',
					closeOnClickModal:false,
				}).then(({ value }) => {
					row[column.property] = value
					// localStorage.removeItem("tableData");
					this.formConfig()
					// localStorage.setItem('tableData',JSON.stringify(this.tableData));
				}).catch(() => {

				});
			},
			handleClick(row) {
				// console.log(row);
			},
			setUp(){//点击设置的位置
				this.setUpIndex++
				if(this.setUpIndex>10){//点击大于10次则打开设置框
					this.dialogFormVisible = true
					setTimeout(()=>{
						this.setUpIndex=0
					},3000)
				}
			},
			initWebSocket(){
				// ${location.host}
				this.$connect(`//localhost:8089/WebSocket/WebSocket`);
			},
			clickWebsocket(item){
				if(item.key=='微信'||item.name=='微信'){
					const childProcess = window.require('child_process');
					const exec = childProcess.exec;
					let path = "start "+item.path;
					exec(path,{
						maxBuffer: 1024 * 2000
					}, function(err, stdout, stderr) {
					});
				}else if(item.key=='close'||item.name=='退出桌面'){
				  this.close()
        		}else{
					if(this.implement){
						this.$socket.sendObj({
							code: '35',
							params: {
								"name":item.name
							},
							message:"打开应用"
						});
						this.implement = false
						setTimeout(()=>{
							this.implement = true
						},300)
					}
					//code 35打开  42关闭  74切换
					//打开报错  507   切换  508   关闭  509
				}
			},
			closeExe(item,index){//关闭应用程序
				if(item.local.key=='微信'||item.local.name=='微信'){
					this.viewProcessMessage('WeChat.exe',function (msg) {
						try {
							//关闭匹配的进程
							window.process.kill(msg)
						}catch (e) {

						}
					})
				}else{
					this.$socket.sendObj({
						code: '42',
						params: {
							type: item.type,//应用名称
							value: item.count[index],//子应用名称
						},
						message:"关闭应用"
					});
				}
			},
			switchExe(item,index){//切换应用程序
				if(item.local.key=='微信'||item.local.name=='微信'){
					const childProcess = window.require('child_process');
					const exec = childProcess.exec;
					let path = "start "+item.local.path;
					exec(path,{
						maxBuffer: 1024 * 2000
					}, function(err, stdout, stderr) {
					});
				}else{
					this.$socket.sendObj({
						code: '35',
						params: {
							"name":item.local.name
						},
						message:"打开应用"
					});
					//code 35打开  42关闭  74切换
					//打开报错  507   切换  508   关闭  509
				}
				// this.$socket.sendObj({
				// 	code: '74',
				// 	params: {
				// 		type: item.type,//应用名称
				// 		value: item.count[index],//子应用名称
				// 	},
				// 	message:"切换应用"
				// });
				//code 35打开  42关闭  74切换
				//打开报错  507   切换  508   关闭  509
			},
			viewProcessMessage (name, cb) {
				const { exec } = window.require("child_process");
				// process 不用引入，nodeJS 自带
				// 带有命令行的list进程命令是：“cmd.exe /c wmic process list full”
				//  tasklist 是没有带命令行参数的。可以把这两个命令再cmd里面执行一下看一下效果
				// 注意：命令行获取的都带有换行符，获取之后需要更换换行符。可以执行配合这个使用 str.replace(/[\r\n]/g,""); 去除回车换行符
				exec('tasklist', function (err, stdout, stderr) {
					if (err) {
						return console.error(err)
					}
					stdout.split('\n').filter((line) => {
						let processMessage = line.trim().split(/\s+/)
						let processName = processMessage[0] //processMessage[0]进程名称 ， processMessage[1]进程id
						// console.log('processMessage',processMessage)
						// console.log('line',line)
						if (processName === name) {
							console.log(cb(processMessage[1]))
							return cb(processMessage[1])
						}
					})
				})
			},
			clickWindowsIcon(){
				this.clickWindowsMenu=!this.clickWindowsMenu
				this.clickWindows=true
				setTimeout(()=>{
					this.clickWindows=false
				},200)
			}
		}
	}
</script>

<style lang="less">
	.loading {
		width: 48px;
		height: 48px;
		display: inline-block;
		position: relative;
	}

	.loading::after,
	.loading::before {
		content: "";
		width: 48px;
		height: 48px;
		border: 2px solid #ddd;
		position: absolute;
		left: 0;
		top: 0;
		animation: rotation 2s ease-in-out infinite;
	}

	.loading::after {
		border-color: #409EFF;
		animation-delay: 1s;
	}

	@keyframes rotation {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
	.loadingBox{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%,-50%);
	}
	.loadingSpot{
		display: inline-block;
		height: 1em;
		line-height: 1;
		text-align: left;
		vertical-align: -.25em;
		overflow: hidden;
	}
	.loadingSpot::before {
		display: block;
		content: '...\A..\A.';
		white-space: pre-wrap;
		animation: loading 2s infinite step-start both;
	}
	@keyframes loading {
		33.3% { transform: translateY(-2em); }
		66.6% { transform: translateY(-1em); }
	}
	.mask{
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 99999;
		background: rgba(51,51,51,0.9);

	}
	.setUpMain{
		width: 100%;
		height: 500px;
	}
	.dialog-footer{
		display: flex;
		justify-content: center;
	}
	.closeSvg{
		width: 24px;
		height: 24px;
		position: absolute;
		top: 5px;
		right: 5px;
		/*background-image: url("../public/img/close.svg");*/
		/*background-repeat: no-repeat;*/
		/*background-position: center center;*/
	}
	.taskbarLeft{
		width: 100%;
		display: flex;
		justify-content: left;
	}
	.imgBgBox{
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		flex-wrap: wrap;
		align-content: stretch;
	}
	.itemMainBox{
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 10px 0;
	}
	.previewItemBox:hover .closeSvg{
		border-radius: 5px;
		background-color: red;
		background-image: url("../public/img/closes.svg");
		background-repeat: no-repeat;
		background-position: center center;
	}
	.previewItemBox:hover{
		background: #ccc;
	}
	.previewItem{
		/*width: 300px;*/
		height: 236px;
		position: absolute;
		bottom: 42px;
		left: 20px;
		display: none;
	}
	.previewItemBox{
		width: 300px;
		height: 216px;
		margin: auto;
		padding-bottom: 10px;
		border-radius: 7px;
		box-sizing: border-box;
		background-color: #F7F7F7;
	}
	.taskbarItem:hover .previewItem{
		display: block;
	}
	.main {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		background: url('../public/img/img28.jpg');
		background-size: 100% 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		user-select:none;
	}
	.mainBox{
		width: 86vw;
		height: 84vh;
		margin-bottom: 48px;
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		flex-wrap: wrap;
		align-content: stretch;
	}
	.mainItem{
		width: 31%;
		height: 30%;
		/*border: 1px solid #52DECE;*/
		background-color: #52DECE;
		display: flex;
	}
	.mainItemCenter{
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
		cursor: pointer;
	}
	.setUp{
		position: absolute;
		top: 0;
		left: 0;
		width: 100px;
		height: 100px;
	}
	.mask{
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 48px;
		z-index: 100000;
	}
	.menuMain{
		width: 176px;
		height: 108px;
		padding: 14px 0;
		border-radius: 5px;
		background: #E8F5F6;
		box-sizing: border-box;
		position: absolute;
		bottom: -100px;
		left: 8px;
		cursor: pointer;
		box-shadow: darkgrey 0px 0px 15px 0px;
		transition: all 0.3s;
		z-index: 999999;
		opacity: 0;
	}
	.menuMainHide{
		position: absolute;
		bottom: 52px;
		left: 8px;
		z-index: 100001;
		opacity: 1;
	}
	.menuMainItem{
		width: 100%;
		height: 40px;
		line-height: 40px;
		text-align: center;
	}
	.menuMainItem:hover{
		background-color: rgba(211,211,211,0.3);
	}
	.taskbar {
		width: 100%;
		height: 48px;
		padding:0 20px;
		box-sizing: border-box;
		background-color: #CEF5F6;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999999;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.taskbarItem {
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		/*border: 1px solid #ccc;*/
		box-sizing: border-box;
		transition: all 0.3s;
	}
	.taskbarItem:hover{
		width: 40px;
		height: 40px;
		border-radius: 7px;
		background: #E7F4F7;
		box-shadow: darkgrey 0px 0px 15px 0px;
		transition: all 0.3s;
	}
	.windowsSvg{
		cursor: pointer;
		animation: msClock 1.8s linear infinite;
	}
	@keyframes msClock{
		0%,90%,100%{ transform: scale(1);}
		20%,40%{ transform: scale(0.5);}
		30%,50%{ transform: scale(0.1);}
	}
	#app {
		font-family: Avenir, Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		text-align: center;
		color: #2c3e50;
	}

	#nav {
		padding: 30px;

		a {
			font-weight: bold;
			color: #2c3e50;

			&.router-link-exact-active {
				color: #42b983;
			}
		}
	}
</style>
