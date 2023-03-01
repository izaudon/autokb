import fs from "fs"
import moment from "moment"

export const handler = async msg => {
  if(msg.author.bot) return
  if(!/(K|k)(O|o)(B|b)(A|a)|こば|コバ|木場/.test(msg.content)) return

  switch(true){
    case /こんにち/.test(msg.content):
      msg.channel.send("こんにちは。")
      break
    case /登録/.test(msg.content):
      entryMe()
      break
    case /追加/.test(msg.content):
      entrySub(msg.author.username)
      break
    case /欠席|遅刻/.test(msg.content):
      contact(msg.content, msg.author.username)
      break
    case /確認/.test(msg.content):
      check(msg.content, msg.author.username)
      break
    case /退会/.test(msg.content):
      leave(msg.content, msg.author.username)
      break
    case /削除/.test(msg.content):
      del(msg.content, msg.author.username)
      break
    case /みくじ/.test(msg.content): {
      let arr = [
        "> \[**大吉**\]", 
        "> \[**吉**\]", 
        "> \[**中吉**\]", 
        "> \[**小吉**\]", 
        "> \[**末吉**\]",
        "> \[**凶**\]", 
        "> \[**大凶**\]", 
      ]
      let weight = [4, 10, 7, 7, 5, 3, 1]
      fortune(arr, weight)
      break
    }
    default:
      msg.channel.send("なんですか")
      break
  }
  
  function entryMe(){/*
    msg.channel.send("学籍番号を教えてください")
    const filter = msg => !msg.author.bot*/
    let aid = msg.author.username
    /*const collected = msg.channel.awaitMessages({filter, max: 1, time: 10 * 1000 })
    .then(collected => {
      if(!collected.size) return msg.channel.send("タイムアウト")
      newData(collected.first().content, aid)
    })*/
    newData(aid)
  }

  function newData(aid){
    let data = [
      {
        subject: "all",
        absence: 0,
        abcount: 0,
        lateness: 0,
        countall: 0,
      }
    ]
    let path = './data/'+ aid + '.json'
    if(fs.existsSync(path)){
      msg.channel.send("既に存在します。")
    }else{
      fs.writeFileSync('./data/'+ aid + '.json', JSON.stringify(data,null,"  "))
      msg.channel.send(aid + 'で登録しました。')
    }
  }

  async function contact(mess,aid){
    if(!fs.existsSync("./data/"+aid+".json")) return msg.channel.send("ユーザー情報が登録されていません。")
    msg.channel.send("教科を教えてください。")
    const filter = msg => !msg.author.bot 
    const collected = msg.channel.awaitMessages({filter, max: 1, time: 10 * 1000 })
    .then(collected => {
      if(!collected.size) return msg.channel.send("タイムアウト")
      const sub = collected.first().content
      const job = JSON.parse(fs.readFileSync("./data/" + aid + ".json"))
      const hoge = job.find((v)=>v.subject == sub)
      if(typeof hoge === "undefined"){
        return msg.channel.send(sub + "は登録されていません。")
      }else{
        const newData = job.filter(function(item,index){
          if(item.subject != sub) return true
        })
        const changeData = job.filter(function(item,index){
          if(item.subject == sub) return true
        })
        if(/欠席/.test(mess)){
          changeData[0].absence += 2
          changeData[0].abcount += 1
          changeData[0].countall += 2
          const currentTime = moment()
          msg.channel.send(sub + "の欠席をカウントしました。(" + currentTime.format("YYYY/MM/DD HH:mm:ss") + ")")
        }else if(/遅刻/.test(mess)){
          changeData[0].latecount += 1
          if(changeData[0].latecount%3 == 0){
            changeData[0].lateness += 1
            changeData[0].countall += 1
          }
          msg.channel.send(sub + "の遅刻をカウントしました。(" + currentTime.format("YYYY/MM/DD HH:mm:ss") + ")")
        }
        if(changeData[0].countall >= 20){
            msg.channel.send("**留年です。**")
          }else if(changeData[0].countall >= 18){
            msg.channel.send("**あと1回欠席すると留年です。**")
          }else if(changeData[0].countall >= 16){
            msg.channel.send("**あと2回欠席すると留年です。**")
          }else if(changeData[0].countall >= 14){
            msg.channel.send("**あと3回欠席すると留年です。**")
          }else if(changeData[0].countall >= 12){
            msg.channel.send("**あと4回欠席すると留年です。**")
          }else if(changeData[0].countall >= 10){
            msg.channel.send("**あと5回欠席すると留年です。**")
          }
        newData.push(changeData[0])
        fs.writeFileSync("./data/" + aid + ".json", JSON.stringify(newData,null,"  "))

      }
    })
  }

  function entrySub(aid){
    if(!fs.existsSync("./data/"+aid+".json")) return msg.channel.send("ユーザー情報が登録されていません。")
    msg.channel.send("教科を教えてください。")
    const filter = msg => !msg.author.bot
    const collected = msg.channel.awaitMessages({filter, max: 1, time: 10 * 1000 })
    .then(collected => {
      if(!collected.size) return msg.channel.send("タイムアウト")
      add(collected.first().content, aid)
    })
  }

  function add(sub, aid){
    if(!fs.existsSync("./data/"+aid+".json")) return msg.channel.send("ユーザー情報が登録されていません。")
    const job = JSON.parse(fs.readFileSync("./data/" + aid + ".json"))
    const hoge = job.find((v)=>v.subject == sub)
    if(typeof hoge === "undefined"){
      const addData = {
        subject: sub,
        absence: 0,
        abcount: 0,
        lateness: 0,
        latecount: 0,
        countall: 0,
      }
      job.push(addData)
      fs.writeFileSync("./data/" + aid + ".json", JSON.stringify(job,null,"  "))
      msg.channel.send(sub + "を登録しました。")
    }else{
      return msg.channel.send("既に存在します。")
    }
  }

  function del(mess, aid){
    if(!fs.existsSync("./data/"+aid+".json")) return msg.channel.send("ユーザー情報が登録されていません。")
    msg.channel.send("教科を教えてください。")
    const filter = msg => !msg.author.bot
    const collected = msg.channel.awaitMessages({filter, max: 1, time: 10 * 1000 })
    .then(collected => {
      if(!collected.size) return msg.channel.send("タイムアウト")
      //delData(collected.first().content, aid)
      const sub = collected.first().content
      const job = JSON.parse(fs.readFileSync("./data/" + aid + ".json"))
      const hoge = job.find((v)=>v.subject == sub)
      if(typeof hoge === "undefined"){
        return msg.channel.send(sub + "は登録されていません。")
      }else{
        const newData = job.filter(function(item,index){
          if(item.subject != sub) return true
        })
      fs.writeFileSync("./data/" + aid + ".json", JSON.stringify(newData,null,"  "))
      msg.channel.send(sub + "を削除しました。")
      }
    })
  }

  function delData(sub, aid){
    const job = JSON.parse(fs.readFileSync("./data/" + aid + ".json"))
    const newData = job.filter(function(item,index){
      if(item.subject != sub) return true
    })
    
  }

  async function check(mess,aid){
    if(!fs.existsSync("./data/"+aid+".json")){
      return msg.channel.send("ユーザー情報が登録されていません。")
    }
    const job = JSON.parse(fs.readFileSync("./data/" + aid + ".json"))
    const newData = job.filter(function(item,index){
      if(item.subject != "all") return true
    })
    let jobout = newData.map(value => {
      return {
        "教科":value.subject,
        "欠課時数":value.absence,
        "欠席回数":value.abcount,
        "遅刻による欠課時数":value.lateness,
        "遅刻回数":value.latecount,
        "総欠課時数":value.countall
        }
    })
    const path = "./data/" + aid + "\_sData.json"
    fs.writeFileSync(path, JSON.stringify(jobout,null,"  "))
    await msg.channel.send({files:[path]})
    await fs.unlink(path, (err)=>{
      if(err) throw err
    })
  }
  function fortune(arr, weight){
    let totalweight=0;
    for(var i=0;i<weight.length;i++){
      totalweight+=weight[i];
    }
    let random = Math.floor(Math.random()*totalweight);
    for(var i = 0;i<weight.length;i++){
      if(random<weight[i]){
        msg.channel.send(arr[i])
        return;
      }else{
        random -= weight[i];
      }
    }
    console.log("lottery error");
  }

  function leave(mess, aid){
    if(!fs.existsSync("./data/"+aid+".json")){
      return msg.channel.send("ユーザー情報が登録されていません。")
    }
    msg.channel.send("ユーザーデータを削除しますか？(削除したデータは復元できません)")
    msg.channel.send("y/n")
    const filter = msg => !msg.author.bot
    const collected = msg.channel.awaitMessages({filter, max: 1, time: 10 * 1000 })
    .then(collected => {
      if(!collected.size) return msg.channel.send("タイムアウト")
      leaveData(collected.first().content, aid)
    })
  }

  async function leaveData(mess, aid){
    if(mess == "y"){
      const path = "./data/" + aid + ".json"
      await fs.unlink(path, (err)=>{
        if(err) throw err
      })
      msg.channel.send("ユーザーデータを削除しました。")
    }else if(mess == "n"){
      return msg.channel.send("取り消しました。")
    }
  }

}
