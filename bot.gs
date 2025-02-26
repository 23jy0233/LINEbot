//トリガーから実行する用の、user_idを定義
var glb_user_id = '';

//LINE Messaging API のチャネルアクセストークンを取得
var CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("LINE_TOKEN");

var line_endpoint_reply = 'https://api.line.me/v2/bot/message/reply';
var line_endpoint_push = 'https://api.line.me/v2/bot/message/push';
var line_endpoint_profile = 'https://api.line.me/v2/bot/profile';

//ユーザー名を取得
function getUserDisplayName(user_id) {
  var res = UrlFetchApp.fetch(line_endpoint_profile + '/' + user_id, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'get',
  });
  return JSON.parse(res).displayName;
}

//スプレッドシートの作成
function createSpreadSheet(user_id) {
  //スプレッドシートの名前
  var spreadSheet = SpreadsheetApp.create("「いつかやろう」防止システム_「"+ getUserDisplayName(user_id) + "」の記録");

  //各シートの設定
  var sheet1 = spreadSheet.getSheets()[0];
  var sheet2 = spreadSheet.insertSheet();
  var sheet3 = spreadSheet.insertSheet();
  var sheet4 = spreadSheet.insertSheet();

  sheet1.setName('未達成メモ一覧');
  sheet2.setName('達成済みメモ一覧');
  sheet3.setName('定期メモと通知日の設定');
  sheet4.setName('いままでの記録');

  var range1 = sheet1.getRange('A1:C2');
  var range2 = sheet2.getRange('A1:C2');
  var range3 = sheet3.getRange('A1:I10');
  var range4 = sheet4.getRange('A1:C6');


  var unach = [
    ['未達成メモ一覧', '', ''],
    ['送信日時', '最後に通知した日', 'メモ内容'],
  ]

  var ach = [
    ['達成済みメモ一覧', '', ''],
    ['送信日時', '達成日', 'メモ内容'],
  ]

  var week = [
    ['一週間の定期メモ', '', '', '', '', '', '', '', ''],
    ['', '',         '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
    ['',    '内容', '',      '',      '',      '',      '',      '',      ''     ],
    ['',    '時間', '',      '',      '',      '',      '',      '',      ''     ],
    ['', '', '', '', '', '', '', '', ''],//空白行
    ['通常メモの送信日時', '', '', '', '', '', '', '', ''],
    ['', '',         '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
    ['',    '時間', '',      '',      '',      '',      '',      '',      ''     ],
    ['', '', '', '', '', '', '', '', ''],//空白行
    ['通常メモの通知数', '', '回', '', '', '', '', '', '']
  ]

  var record = [
    ['いままでの記録', '', ''],
    ['総達成回数', '', '回'],
    ['', '', ''],//空白行
    ['達成した通常メモの数', '', '個'],
    ['', '', ''],//空白行
    ['達成した定期メモの数', '', '個'],
  ]

  PropertiesService.getScriptProperties().setProperty(user_id, spreadSheet.getId());
  var file = DriveApp.getFileById(spreadSheet.getId());
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  range1.setValues(unach);
  range2.setValues(ach);
  range3.setValues(week);
  range4.setValues(record);

  return spreadSheet;
}

//スプレッドシートのURLを取得
function getSpreadSheet(user_id) {
  var sid = PropertiesService.getScriptProperties().getProperty(user_id);
  if (sid == null) {
    return createSpreadSheet(user_id);
  } else {
    try {
      return SpreadsheetApp.openById(sid);
    } catch(e) {
      return createSpreadSheet(user_id);
    }
  }
}

//スプレッドシートにメモを追加
function addToSpreadSheet(user_id, message) {
  var today = new Date();
  var spreadSheet = getSpreadSheet(user_id);
  var sheet1 = spreadSheet.getSheets()[0];
  sheet1.appendRow([today, today, message]);
}

//通常メモの通知日の変更
function notificationDate(user_id, week, hour, minutes) {
  var reply_message;

  var spreadSheet = getSpreadSheet(user_id);
  var sheet3 = spreadSheet.getSheets()[2];

  if(hourMinutesConfirmation(hour, minutes) == false){
    reply_message = "時刻の設定がおかしいよ...\n時間は00～23、分は00～59の範囲で指定してね！";
    return reply_message;
  }

  switch(week) {
    case '月曜日':
      sheet3.getRange("C8").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_normal').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(23).create();
      reply_message = nomalSettingMessage(week, hour, minutes);
      break;
    case '火曜日':
      sheet3.getRange("D8").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_normal').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(23).create();
      reply_message = nomalSettingMessage(week, hour, minutes);
      break;
    case '水曜日':
      sheet3.getRange("E8").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_normal').timeBased().onWeekDay(ScriptApp.WeekDay.TUESDAY).atHour(23).create();
      reply_message = nomalSettingMessage(week, hour, minutes);
      break;
    case '木曜日':
      sheet3.getRange("F8").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_normal').timeBased().onWeekDay(ScriptApp.WeekDay.WEDNESDAY).atHour(23).create();
      reply_message = nomalSettingMessage(week, hour, minutes);
      break;
    case '金曜日':
      sheet3.getRange("G8").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_normal').timeBased().onWeekDay(ScriptApp.WeekDay.THURSDAY).atHour(23).create();
      reply_message = nomalSettingMessage(week, hour, minutes);
      break;
    case '土曜日':
      sheet3.getRange("H8").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_normal').timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(23).create();
      reply_message = nomalSettingMessage(week, hour, minutes);
      break;
    case '日曜日':
      sheet3.getRange("I8").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_normal').timeBased().onWeekDay(ScriptApp.WeekDay.SATURDAY).atHour(23).create();
      reply_message = nomalSettingMessage(week, hour, minutes);
      break;
    default:
      reply_message = "曜日の設定がおかしいよ...\n曜日をもう一度確認して入力し直してみてね！";
      break;
  }

  return reply_message;
}

//定期メモの登録
function repeatMemoDate(user_id, memo, week, hour, minutes) {
  var reply_message;

  var spreadSheet = getSpreadSheet(user_id);
  var sheet3 = spreadSheet.getSheets()[2];

  if(hourMinutesConfirmation(hour, minutes) == false){
    reply_message = "時刻の設定がおかしいよ...\n時間は00～23、分は00～59の範囲で指定してね！";
    return reply_message;
  }

  switch(week) {
    case '月曜日':
      sheet3.getRange("C3").setValue(memo);
      sheet3.getRange("C4").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_repeat').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(23).create();
      reply_message = repeatSettingMessage(week, hour, minutes);
      break;
    case '火曜日':
      sheet3.getRange("D3").setValue(memo);
      sheet3.getRange("D4").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_repeat').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(23).create();
      reply_message = repeatSettingMessage(week, hour, minutes);
      break;
    case '水曜日':
      sheet3.getRange("E3").setValue(memo);
      sheet3.getRange("E4").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_repeat').timeBased().onWeekDay(ScriptApp.WeekDay.TUESDAY).atHour(23).create();
      reply_message = repeatSettingMessage(week, hour, minutes);
      break;
    case '木曜日':
      sheet3.getRange("F3").setValue(memo);
      sheet3.getRange("F4").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_repeat').timeBased().onWeekDay(ScriptApp.WeekDay.WEDNESDAY).atHour(23).create();
      reply_message = repeatSettingMessage(week, hour, minutes);
      break;
    case '金曜日':
      sheet3.getRange("G3").setValue(memo);
      sheet3.getRange("G4").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_repeat').timeBased().onWeekDay(ScriptApp.WeekDay.THURSDAY).atHour(23).create();
      reply_message = repeatSettingMessage(week, hour, minutes);
      break;
    case '土曜日':
      sheet3.getRange("H3").setValue(memo);
      sheet3.getRange("H4").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_repeat').timeBased().onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(23).create();
      reply_message = repeatSettingMessage(week, hour, minutes);
      break;
    case '日曜日':
      sheet3.getRange("I3").setValue(memo);
      sheet3.getRange("I4").setValue(hour + "時" + minutes + "分");
      ScriptApp.newTrigger('setTrigger_repeat').timeBased().onWeekDay(ScriptApp.WeekDay.SATURDAY).atHour(23).create();
      reply_message = repeatSettingMessage(week, hour, minutes);
      break;
    default:
      reply_message = "曜日の設定がおかしいよ...\n曜日をもう一度確認して入力し直してみてね！";
      break;
  }

  return reply_message;
}

// 時間の確認
function hourMinutesConfirmation(hour, minutes){
  if(hour < 0 || 23 < hour){
    return false;
  } else if(minutes < 0 || 59 < minutes) {
    return false;
  }
}

// 通常メモの通知日の設定完了メッセージ
function nomalSettingMessage(week, hour, minutes){
  reply_message = week + " " + hour + "時" + minutes + "分 に通知します！";

  return reply_message;
}

// 定期メモの設定完了メッセージ
function repeatSettingMessage(week, hour, minutes){
  reply_message = week + " " + hour + "時" + minutes + "分 に通知します！";

  return reply_message;
}

// 通常メモのトリガーのセット
function setTrigger_normal() {
  var spreadSheet = getSpreadSheet(glb_user_id);
  var sheet3 = spreadSheet.getSheets()[2];

  // 現在の日時を取得し、一日ずらす(トリガーの実行が被らないように、月曜日に通知する場合は日曜日の23時にトリガーを実行させているため)
  var date = new Date();
  date.setDate(date.getDate() + 1);

  // weekに現在の曜日を入れ、coordinateで曜日によってスプレッドシートの座標が変わるようにしている
  var week = String(date.getDay());

  var coordinate = week.replace(/1/,'C').
                        replace(/2/,'D').
                        replace(/3/,'E').
                        replace(/4/,'F').
                        replace(/5/,'G').
                        replace(/6/,'H').
                        replace(/0/,'I');

  var time = new Date(Utilities.formatDate(date, 'JST', 'yyyy/MM/dd ' + sheet3.getRange(coordinate + "8").getDisplayValue()));

  ScriptApp.newTrigger('nomalNotification').timeBased().at(time).create();
}

// 定期メモのトリガーのセット
function setTrigger_repeat() {
  var spreadSheet = getSpreadSheet(glb_user_id);
  var sheet3 = spreadSheet.getSheets()[2];

  // 現在の日時を取得し、一日ずらす(トリガーの実行が被らないように、月曜日に通知する場合は日曜日の23時にトリガーを実行させているため)
  var date = new Date();
  date.setDate(date.getDate() + 1);

  // weekに現在の曜日を入れ、coordinateで曜日によってスプレッドシートの座標が変わるようにしている
  var week = String(date.getDay());

  var coordinate = week.replace(/1/,'C').
                        replace(/2/,'D').
                        replace(/3/,'E').
                        replace(/4/,'F').
                        replace(/5/,'G').
                        replace(/6/,'H').
                        replace(/0/,'I');

  var time = new Date(Utilities.formatDate(date, 'JST', 'yyyy/MM/dd ' + sheet3.getRange(coordinate + "4").getDisplayValue()));

  ScriptApp.newTrigger('repeatNotification').timeBased().at(time).create();
}

// トリガーの削除
function delTriggerNomalNotification() {
  const triggers = ScriptApp.getProjectTriggers();

  for(const trigger of triggers){
    if(trigger.getHandlerFunction() == "nomalNotification"){
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function delTriggerRepeatNotification() {
  const triggers = ScriptApp.getProjectTriggers();

  for(const trigger of triggers){
    if(trigger.getHandlerFunction() == "repeatNotification"){
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function delTriggerSetNomal() {
  const triggers = ScriptApp.getProjectTriggers();

  for(const trigger of triggers){
    if(trigger.getHandlerFunction() == "setTrigger_nomal"){
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

function delTriggerSetRepeat() {
  const triggers = ScriptApp.getProjectTriggers();

  for(const trigger of triggers){
    if(trigger.getHandlerFunction() == "setTrigger_repeat"){
      ScriptApp.deleteTrigger(trigger);
    }
  }
}

// メッセージ返信
function reply(reply_token, messages) {
  UrlFetchApp.fetch(line_endpoint_reply, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': reply_token,
      'messages': messages,
    }),
  });
  ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

// プッシュ通知
function pushMessage(messages) {
  UrlFetchApp.fetch(line_endpoint_push, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'to': glb_user_id,
      'messages': messages,
    }),
  });
}

function getNomalMemos(spreadSheet, array) {
  var sheet1 = spreadSheet.getSheets()[0];

  var message = 
      {
        "type": "template",
        "altText": "メモの通知",
        "template": {
          "type": "confirm",
          "text": '' + array[2],
          "actions": [
            {
              "type": "message",
              "label": "OK",
              "text": "達成した通常メモ " + array[2] + " 日時 " + Utilities.formatDate(array[0], 'JST', 'yyyy-MM-dd HH:mm:ss')
            },
            {
              "type": "message",
              "label": "まだ",
              "text": "まだ"
            }
          ]
        }
      };

  return message;
}

function getRepeatMemos(spreadSheet, memo, weekday) {
  var sheet1 = spreadSheet.getSheets()[0];

  var message = 
      {
        "type": "template",
        "altText": "メモの通知",
        "template": {
          "type": "confirm",
          "text": '' + memo,
          "actions": [
            {
              "type": "message",
              "label": "OK",
              "text": "達成した定期メモ " + memo + " " + weekday + "曜日"
            },
            {
              "type": "message",
              "label": "まだ",
              "text": "まだ"
            }
          ]
        }
      };

  return message;
}

// 配列の上限5件に引っかからないように分割する関数
function pushMessagesInBatches(memos) {
  var batchSize = 5; // LINEの制約に合わせて5件ずつ送信
  for (var i = 0; i < memos.length; i += batchSize) {
    var batch = memos.slice(i, i + batchSize); // 5件ずつ分割
    pushMessage(batch); // 5件のメッセージを送信
  }
}

// 通常メモの通知
function nomalNotification() {
  var memos = [];
  var spreadSheet = getSpreadSheet(glb_user_id);
  var sheet1 = spreadSheet.getSheets()[0];
  var sheet3 = spreadSheet.getSheets()[2];
  var rowNum = sheet1.getLastRow();
  var memo_rowNum = rowNum - 2;
  var send_times = sheet3.getRange('B10').getValue();

  var sheet_array = sheet1.getRange('A3:C' + rowNum).getValues();
  var array = sheet1.getRange('A3:C' + rowNum).getValues();
  array.sort(function(a, b) { return a[1] - b[1]; });

  if (memo_rowNum < 1) {
    memos.push({
      "type": "text",
      "text": "通知をしようと思ったけど、メモが一個も登録されてないよ！"
    });
  } else if(typeof send_times != 'number' || send_times < 1) {
    // 何もしない
  } else {
    memos.push({
      "type": "text",
      "text": "通知の時間だよ！これらのメモは達成できた？"
    });
    if(memo_rowNum < send_times){
      send_times = memo_rowNum;
    }
    for(var i = 0; i < send_times; i++){
      memos.push(getNomalMemos(spreadSheet, array[i]));
      
      var matchingIndex = getMatchingRowIndex(sheet_array, array[i]);
      
      if (matchingIndex !== -1) { //一致するデータがなかった時(-1のとき)は何もしない
        var date = new Date();
        sheet1.getRange('B' + (matchingIndex + 3)).setValue(date);  // 行番号が3から始まるので+3
      }
    }
  }
  
  pushMessagesInBatches(memos); // 5件ずつ送信する  
}

// 定期メモの通知
function repeatNotification() {
  var memos = [];
  var spreadSheet = getSpreadSheet(glb_user_id);
  var sheet3 = spreadSheet.getSheets()[2];

  // 現在の日時を取得
  var date = new Date();
  date.setDate(date.getDate());

  // weekに現在の曜日を入れ、coordinateで曜日によってスプレッドシートの座標が変わるようにしている
  var week = String(date.getDay());

  var coordinate = week.replace(/1/,'C').
                        replace(/2/,'D').
                        replace(/3/,'E').
                        replace(/4/,'F').
                        replace(/5/,'G').
                        replace(/6/,'H').
                        replace(/0/,'I');
  
  var weekday = week.replace(/1/,'月').
                     replace(/2/,'火').
                     replace(/3/,'水').
                     replace(/4/,'木').
                     replace(/5/,'金').
                     replace(/6/,'土').
                     replace(/0/,'日');

  memos.push({
      "type": "text",
      "text": "定期メモの通知だよ！このメモは達成できた？"
    });
  memos.push(getRepeatMemos(spreadSheet, sheet3.getRange(coordinate + '3').getValue(), weekday));

  pushMessage(memos);
}

// 二次元配列から完全一致する行の最初のインデックスを取得する関数
function getMatchingRowIndex(twoDimArray, targetRow) {
  // 二次元配列をループ
  for (var i = 0; i < twoDimArray.length; i++) {
    // 各行が完全一致するかを確認（Date型と文字列型を比較）
    if (arraysAreEqual(twoDimArray[i], targetRow)) {
      return i; // 一致した最初のインデックスを返す
    }
  }

  return -1;  // 一致しない場合は-1を返す
}

// 二つの配列が完全に一致するかを確認するヘルパー関数
function arraysAreEqual(array1, array2) {
  // 配列の長さが違う場合は不一致
  if (array1.length !== array2.length) {
    return false;
  }

  // 各要素を比較
  for (var i = 0; i < array1.length; i++) {
    // Date型の比較（getTime() で比較）
    if (array1[i] instanceof Date && array2[i] instanceof Date) {
      if (array1[i].getTime() !== array2[i].getTime()) {
        return false; // 日付が一致しない場合は不一致
      }
    }
    // 文字列型の比較
    else if (typeof array1[i] === 'string' && typeof array2[i] === 'string') {
      if (array1[i] !== array2[i]) {
        return false; // 文字列が一致しない場合は不一致
      }
    } 
    else {
      // その他の型（異なる型のデータがあれば不一致と見なす）
      return false;
    }
  }

  return true; // 完全一致
}

function achievementNomalMemos(nomalMemo, dateTime) {
  var memos;
  var spreadSheet = getSpreadSheet(glb_user_id);
  var sheet1 = spreadSheet.getSheets()[0];
  var sheet2 = spreadSheet.getSheets()[1];
  var sheet4 = spreadSheet.getSheets()[3];
  var rowNum = sheet1.getLastRow();
  var memo_rowNum = rowNum - 2;

  var array = sheet1.getRange('A3:C' + rowNum).getDisplayValues();

  if (memo_rowNum < 1) {
    memos = "達成をしようと思ったけど、メモが一個も登録されてないよ！";
  } else {
    memos = "メモが見つからないよ...すでに達成しているか、存在しない可能性があるかも！";
    for(var i = 0; i < memo_rowNum; i++){
      if(array[i][2] == nomalMemo || array[i][0] == dateTime) {
        var today = new Date();
        sheet2.appendRow([dateTime, today, nomalMemo]);
        sheet4.getRange('B2').setValue(sheet4.getRange('B2').getValue() + 1);
        sheet4.getRange('B4').setValue(sheet4.getRange('B4').getValue() + 1);
        sheet1.deleteRow(i + 3);
        memos = "お疲れ様！今回で" + sheet4.getRange('B2').getValue() + "回達成！これからも頑張ろう！";
      }
    }
  }
  return memos;
}

function achievementRepeatMemos(repeatMemo, week) {
  var memos;
  var spreadSheet = getSpreadSheet(glb_user_id);
  var sheet3 = spreadSheet.getSheets()[2];
  var sheet4 = spreadSheet.getSheets()[3];

  var coordinate = week.replace(/月/,'C').
                        replace(/火/,'D').
                        replace(/水/,'E').
                        replace(/木/,'F').
                        replace(/金/,'G').
                        replace(/土/,'H').
                        replace(/日/,'I');
  
  if(sheet3.getRange(coordinate + '3').getValue() == repeatMemo) {
    sheet4.getRange('B2').setValue(sheet4.getRange('B2').getValue() + 1);
    sheet4.getRange('B6').setValue(sheet4.getRange('B6').getValue() + 1);
    memos = "お疲れ様！今回で" + sheet4.getRange('B2').getValue() + "回達成！これからも頑張ろう！";
  } else {
    memos = "メモが見つからないよ...";
  }

  return memos;
}

// メッセージが送られてきたときに実行される処理
function doPost(e) {
  // JSONをパース
  // (LINEから送られてきたメッセージはJSON形式、GASで処理するにはパース(解析)する)
  var json = JSON.parse(e.postData.contents);

  // 送信されてきたメッセージを取得
  // (「user_message」変数に送られてきたメッセージを格納)
  var user_id = json.events[0].source.userId;
  var user_message = json.events[0].message.text;  
  
  // 返信するためのトークンを取得
  var reply_token= json.events[0].replyToken;
  if (typeof reply_token === 'undefined') {
    return;
  }

  // 返信するメッセージを配列で用意する
  var spreadSheet;
  var reply_messages;

  if ('ヘルプ' == user_message) {
    // 「ヘルプ」と入力されたときの返信メッセージ
    reply_messages = ["ボクは「いつかやろう」をなくすために生まれた「イマヤロボット」だよ！\nまずは、「通知回数 〇〇回」と書いてメッセージを送って、一度に何回通知するかを設定してね！\n次に、「通知日 〇曜日 〇〇時〇〇分」と入力してメッセージを送って、通知する曜日と時間を設定するんだ！\n最後に、「いつかはやろうと思っているけど、なかなか達成できない...」「いつかはやりたいけど、すぐに忘れちゃう...」と思っている内容を、何個でも自由に入力してみてね！\nそうしたらボクがその内容を忘れないように、ちゃーんと通知日時に教えてあげるから、君はもし達成できていたなら、送られてきたメッセージの「OK」ボタンを押して、どんどんと「いつかやろう」をなくしていこう！\nほかには、「定期メモ 「〇〇〇〇(メモの内容)」 〇曜日 〇〇時〇〇分」と入力すると、その曜日には一度達成しても何回も通知する「定期メモ」を送れるし、「スプレッドシート」と入力すると、キミが今まで達成したメモや、まだ達成していないメモをスプレッドシートにして送ってあげることもできるよ！用途に応じて使ってみてね！"];// ここの内容考えておく

  } else if ('スプレッドシート' == user_message) {
    //「スプレッドシート」と入力されたときの処理
    // Google スプレッドシートの URL を返信メッセージとする
    spreadSheet = getSpreadSheet(user_id);
    reply_messages = [spreadSheet.getUrl()];

  } else if ('まだ' == user_message) {
    reply_messages = ["しょうがない！また別の日に達成できるよう頑張ろう！"];
  } else if (/^通知回数\s/.test(user_message)) {
    //「通知日」と入力されたときの処理

    try{
      var spreadSheet = getSpreadSheet(user_id);
      var sheet3 = spreadSheet.getSheets()[2];

      var number = user_message.match(/\d{1,2}回/);
      var argNumber = number[0];
      argNumber = argNumber.replace(/回/,'');
      var intNumber = Number(argNumber);

      sheet3.getRange("B10").setValue(intNumber);
    
      reply_messages = ["通知回数を設定しました。"];

    } catch(e) {
      reply_messages = ["正しく入力されてないよ...\n「通知回数 〇〇回」の形式で最後まで入力してね！"];
    }

  } else if (/^通知日\s/.test(user_message)) {
    //「通知日」と入力されたときの処理

    try{
      //「〇曜日」を切り出しweekに格納後、配列型から文字列型にする
      var week = user_message.match(/.曜日/);
      var argWeek = week[0];

      //「〇〇時」を切り出しhourに格納後、配列型から文字列型に、文字列型から整数型にキャストする
      var hour = user_message.match(/\d{1,2}時/);
      var argHour = hour[0];
      argHour = argHour.replace(/時/,'');
      var intHour = Number(argHour);

      //「〇〇分」を切り出しminutesに格納後、配列型から文字列型に、文字列型から整数型にキャストする
      var minutes = user_message.match(/\d{1,2}分/);
      var argMinutes = minutes[0];
      argMinutes = argMinutes.replace(/分/,'');
      var intMinutes = Number(argMinutes);

      reply_messages = [notificationDate(user_id, argWeek, intHour, intMinutes)];

    } catch(e) {
      reply_messages = ["正しく入力されてないよ...\n「通知日 〇曜日 〇〇時〇〇分」の形式で最後まで入力してね！"];
    }
  } else if (/^定期メモ\s/.test(user_message)) {
    //「定期メモ」と入力されたときの処理

    try{
      //「」の中の内容を切り出し
      var memo = user_message.match(/「.*」/);
      var argMemo = memo[0];
      argMemo = argMemo.slice(1, -1);

      //「〇曜日」を切り出しweekに格納後、配列型から文字列型にする
      var week = user_message.match(/.曜日/);
      var argWeek = week[0];

      //「〇〇時」を切り出しhourに格納後、配列型から文字列型に、文字列型から整数型にキャストする
      var hour = user_message.match(/\d{1,2}時/);
      var argHour = hour[0];
      argHour = argHour.replace(/時/,'');
      var intHour = Number(argHour);

      //「〇〇分」を切り出しminutesに格納後、配列型から文字列型に、文字列型から整数型にキャストする
      var minutes = user_message.match(/\d{1,2}分/);
      var argMinutes = minutes[0];
      argMinutes = argMinutes.replace(/分/,'');
      var intMinutes = Number(argMinutes);

      reply_messages = [repeatMemoDate(user_id, argMemo, argWeek, intHour, intMinutes)];

    } catch(e) {
      reply_messages = ["正しく入力されてないよ...\n「定期メモ 「〇〇〇〇」 〇曜日 〇〇時〇〇分」の形式で最後まで入力してね！"];
    }
  } else if (/^達成した通常メモ\s/.test(user_message)) {
    //「達成した通常メモ」と入力されたときの処理

    try{
      var nomalMemoMatch = user_message.match(/達成した通常メモ\s(.+?)\s日時/);
      var dateTimeMatch = user_message.match(/日時\s([\d-]+\s[\d:]+)/);

      var argNomalMemo = "";
      var argDateTime = "";

      // 正規表現の結果を確認し、必要に応じて変数に格納
      if (nomalMemoMatch && nomalMemoMatch[1]) {
        argNomalMemo = nomalMemoMatch[1]; // メモ内容
      }

      if (dateTimeMatch && dateTimeMatch[1]) {
        argDateTime = dateTimeMatch[1]; // 日時部分
      }

      reply_messages = [achievementNomalMemos(argNomalMemo, argDateTime)];

    } catch(e) {
      reply_messages = ["正しく入力されてないよ...\n「達成した通常メモ 〇〇〇〇(メモの内容) 日時 〇〇〇〇(年)-〇〇(月)-〇〇(日) 〇〇(時):〇〇(分):〇〇(秒)」の形式で最後まで入力してね！"];
    }
  } else if (/^達成した定期メモ\s/.test(user_message)) {
    //「達成した通常メモ」と入力されたときの処理

    try {
      // 「達成した定期メモ」の後に続くメモ内容と曜日を取得
      var repeatMemoMatch = user_message.match(/達成した定期メモ\s+(.+?)\s+([月火水木金土日]曜日)/);

      var argRepeatMemo = "";
      var argWeek = "";

      // メモ内容の取得
      if (repeatMemoMatch && repeatMemoMatch[1]) {
          argRepeatMemo = repeatMemoMatch[1]; // メモ内容
      }

      // 曜日を取得
      if (repeatMemoMatch && repeatMemoMatch[2]) {
          argWeek = repeatMemoMatch[2].replace(/曜日/, ""); // "曜日"を削除
      }

      reply_messages = [achievementRepeatMemos(argRepeatMemo, argWeek)];
      
    } catch (e) {
      reply_messages = ["正しく入力されてないよ...\n「達成した定期メモ 〇〇〇〇(メモの内容) 〇曜日」の形式で最後まで入力してね！"];
    }
  } else {
    // メモが入力されたときの処理
    addToSpreadSheet(user_id, user_message);
    reply_messages = ['「' + user_message + '」だね?\n忘れないように覚えておくよ！\n言ってもやらないなんてのは、ダメだからね！'];
  }
  
  // reply_messagesをテキストメッセージタイプにした後、返信する
  var messages = reply_messages.map(function (v) {
    return {'type': 'text', 'text': v};
  });
  reply(reply_token, messages);
  
}
