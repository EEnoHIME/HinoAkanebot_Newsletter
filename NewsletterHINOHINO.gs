// フィード関連の変数
var currentTime = new Date();
var newFeeds = [];



//日野茜ちゃんのコメント集
var messages = [
  '定時報告です!プロデューサー！！',
  'このニュース、何言ってるかさっぱり意味がわからなくて頭がボンバーしそうです！！',
  'お茶でも飲みながら読みましょう！！休憩も大事です！！',
  'お疲れ様です！！ニュースが更新されましたよ！！',
  '私は走ってくるのでその間にも読んでください！！',
];


var get_message = messages[Math.floor(Math.random()*messages.length)];


// 始めの一言を送信
function firstcomment(){
 var subject = get_message;
 var body = "";
 request2LINE(subject,body);
}


// 実際にフィードを得る関数
function myFunction() {
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (var i in sheets) { // 全シートを順番にチェック
    addNewFeeds(sheets[i]);
  }
  post2LINE(); 
}


// フィードの新着チェックを行い、新着があれば配列newFeedsに追加する
function addNewFeeds(sheet) {
  var feeds = getFeeds(sheet);
  for (var i in feeds['feeds']) {
    if (isNew(feeds['feeds'][i][2], feeds['lastCheckTime'])) { // 前回起動時間以降の投稿か判定
      feeds['feeds'][i][3] = sheet.getName();
      newFeeds.push(feeds['feeds'][i]);
    }
  }
}

// 最新のフィードを取得する
function getFeeds(sheet) {
  var values = sheet.getRange(1, 1, 1, 3).getValues(); // getValueを2回実行すると都度通信が入るので、A1:C1を習得
  var url = values[0][0];
  var lastCheckTime = values[0][2]; // C1には前回のタスク実行時刻が入っている
  sheet.getRange('C1').setValue(currentTime);
  var lastRow = sheet.getLastRow();
  var feeds = sheet.getRange(2, 1, lastRow - 1, 3).getValues(); // 一括で範囲内全てを取得する
  return {'feeds': feeds, 'lastCheckTime': lastCheckTime};
}

// 前回のチェック以降の投稿か確認
function isNew(date, lastCheckTime) {
  var postTime = new Date(date);
  return (postTime.getTime() > lastCheckTime.getTime());
}

// LINEにフィードを投稿する
function post2LINE() {
  firstcomment();
  for (var i in newFeeds) {
    var subject = newFeeds[i][3]
    var body = newFeeds[i][0] + "\r\n" + newFeeds[i][1];
    request2LINE(subject, body);
  }
}

// LINEにリクエストを送る
function request2LINE(subject, body) {
  var CHANNEL_ACCESS_TOKEN = "ZItO0r4LHL0X1pqy3yt5sLr4pwxuCvfKsNAFyCiwVKq36XCcz4HRn4m3W6QtPct6MXDq8UqCbxXiv8fn8UaP1nrr38gtOMTEVPvwBOzKEGvHgtW5rCpmTSfPIinv+EX0QCYc+ussayj6SusFrRk84QdB04t89/1O/w1cDnyilFU="; 
  var USER_ID = "Ub8a2957d5e2f6df7312ab6dc10530d2c";
  var postData = {
    "to": USER_ID,
    "messages": [{
      "type": "text",
      "text": subject+body,
    }]
  };

  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type": "application/json",
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  };

  var options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(postData)
  };
  var response = UrlFetchApp.fetch(url, options);
}
