'use strict';

//　1.canvasを使い、tdタグの中に黒丸・白丸を置く
//　※空欄を状態0、黒丸を状態1、白丸を状態2にする
//
//　2.オセロのルールが適用されるよう、プログラムを作る
//　下記2つの条件をどちらも満たす場合、
//　　(1)置いたコマの周りの、1マス以上先に異なる色のコマがある
//　　(2)(1)の先のコマに同じ色のコマがある
//　自分のコマと(2)の間にあるコマの色を反転させる
//
//　3.全てのテーブル枠が埋まったら、点数・判定を出す

let trClass = ''; //trタグに付与したクラスを保存
let tableTd =''; //tdタグの内容を、配列として保存
let canvas = ''; //canvas用1
let ctx = ''; //canvas用2
const pieceSta = {}; //各コマの状態を保存（0:空欄、1:黒丸、2:白丸）
let user = 1; //ユーザー判断（1:プレイヤー1で黒丸、2:プレイヤー2で白丸）
let placeable = 0; //「blackJudge」「whiteJudge」用の変数、0であれば裏返すコマがない、1であれば裏返すコマありとする
let i = 0; //「blackJudge」「whiteJudge」用の変数（for用1）
let j = 0; //「blackJudge」「whiteJudge」用の変数（for用2）
let piecesTotal = 0; //コマのカウント用、36（枠数）-4（初期配置のコマ数）により32が最大値

//スキップボタン、降参ボタンを非活性にする（buttonタグに直接指定する形だとキャッシュの影響かうまく非活性にならない）
document.querySelector('.skipButton').disabled = 'disabled'; //スキップボタンを非活性にする
document.querySelector('.surrenderButton').disabled = 'disabled'; //降参ボタンを非活性にする

//テーブル描画
for(let n = 0; n < 6; n++) {
    //trタグを追加
    document.querySelector('table').insertAdjacentHTML('beforeend',`<tr class="tr${n+1}"></tr>`);
    for(let m = 0; m < 6; m++) {
        //tdタグを追加、trタグへ付与したクラスで追加先を判断
        trClass = `.tr${ n + 1 }`;
        document.querySelector(trClass).insertAdjacentHTML('beforeend',`<td><canvas class="canvas${6 * n + m + 1}" width="62px" height="62px"></canvas></td>`); // 62pxまでであればtableは変形しない
        pieceSta[6 * n + m + 1] = 0;  //各コマのステータスを0として保存
    }
}

//各tdタグを配列として保存
tableTd = document.querySelectorAll('table tr td');

//スキップボタン用
document.querySelector('.skipButton').onclick = function(){
    if(user === 1) {
        user = 2; //user変更
        document.querySelector('.teban').textContent = '【スキップされました】プレイヤー2（白）の番です';
    } else if(user === 2) {
        user = 1; //user変更
        document.querySelector('.teban').textContent = '【スキップされました】プレイヤー1（黒）の番です';
    } else {
        document.querySelector('.teban').textContent = `【スキップされました】エラー発生：${user}`;
    }
}

//降参ボタン用
document.querySelector('.surrenderButton').onclick = function(){
    document.querySelector('.skipButton').disabled = 'disabled'; //スキップボタンを非活性にする
    finalVerdict();
}

//スタートボタンを押した後、コマを押せるようにする
document.querySelector('.startButton').onclick = function(){
    document.querySelector('.startButton').disabled = 'disabled'; //スタートボタンを非活性にする
    document.querySelector('.skipButton').disabled = ''; //スキップボタンを活性にする
    document.querySelector('.surrenderButton').disabled = ''; //降参ボタンを活性にする
    //初期配置
    blackAdd(15);
    blackAdd(22);
    whiteAdd(16);
    whiteAdd(21);
    document.querySelector('.teban').textContent = 'プレイヤー1（黒）の番です';
    //テーブルの枠を押すと、コマが追加される
    tableTd.forEach(function(item,index){
        item.onclick = function() {
            placeable = 0; //裏返すコマがあるかどうかの判定リセット
            if(pieceSta[index+1] === 0) {
                if(user === 1) {
                    console.log(`click1:${index+1}が押された`); //確認用
                    blackJudge(index+1);
                    if(placeable === 1) {
                        canvas = document.querySelector(`.canvas${index+1}`);
                        ctx = canvas.getContext('2d');
                        ctx.beginPath();
                        ctx.arc(31,31,28,0,360,0); //黒丸を作成
                        ctx.fill();
                        pieceSta[index+1] = 1; //コマの状態変更
                        console.log(pieceSta); //確認用（各コマの状態出力）
                        user = 2; //user変更
                        document.querySelector('.teban').textContent = 'プレイヤー2（白）の番です';
                        piecesTotal++;
                    }
                } else if (user === 2) {
                    console.log(`click2:${index+1}が押された`); //確認用
                    whiteJudge(index+1);
                    if(placeable === 1) {
                        canvas = document.querySelector(`.canvas${index+1}`);
                        ctx = canvas.getContext('2d');
                        ctx.beginPath();
                        ctx.arc(31,31,28,0,360,0); //白丸を作成
                        ctx.stroke();
                        pieceSta[index+1] = 2; //コマの状態変更
                        console.log(pieceSta); //確認用（各コマの状態出力）
                        user = 1; //user変更
                        document.querySelector('.teban').textContent = 'プレイヤー1（黒）の番です';
                        piecesTotal++;
                    }
                } else {
                    console.log('エラー');
                    document.querySelector('.teban').textContent = 'エラー';
                }
            }
            //結果判定用
            if(piecesTotal ===  32) {
                finalVerdict();
            }
        }
    });
}

//↓----------function----------↓

//結果判定用
function finalVerdict() {
    document.querySelector('.skipButton').disabled = 'disabled'; //スキップボタンを非活性にする
    document.querySelector('.surrenderButton').disabled = 'disabled'; //降参ボタンを非活性にする
    let b = 0;
    let w = 0;
    for(let p in pieceSta) {
        if(pieceSta[p] === 1) {
            b++;
            console.log(`b：${b}、p:${p}`);
        } else if(pieceSta[p] === 2) {
            w++;
            console.log(`w：${w}、p:${p}`);
        } else {
            console.log(`エラー、p:${p}、値：${pieceSta[p]}`);
        }
    }
    if(b > w) {
        document.querySelector('.teban').textContent = `ゲーム終了！黒${b}、白${w}でプレイヤー1（黒）の勝利！`;
    } else if(b < w) {
        document.querySelector('.teban').textContent = `ゲーム終了！黒${b}、白${w}でプレイヤー2（白）の勝利！`;
    } else if(b === w) {
        document.querySelector('.teban').textContent = `ゲーム終了！黒${b}、白${w}で引き分け！`;
    } else {
        document.querySelector('.teban').textContent = `エラーが発生しました：黒${b}、白${w}`;
    }
}

//黒丸追加用
function blackAdd(bnum) {
    canvas = document.querySelector(`.canvas${bnum}`);
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(31,31,28,0,360,0); //黒丸を作成
    ctx.fill();
    pieceSta[bnum] = 1; //コマの状態変更
    console.log(`blackAdd${bnum}`);
}

//白丸追加
function whiteAdd(wnum) {
    canvas = document.querySelector(`.canvas${wnum}`);
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(31,31,28,0,360,0); //白丸を作成
    ctx.stroke();
    pieceSta[wnum] = 2; //コマの状態変更
    console.log(`whiteAdd${wnum}`);
}

//裏返すかどうか判定（プレイヤー1用）
//pieceStaが2（白）の場合作動
//引数部分には、置いたコマの位置が入る
function blackJudge(bjnum) {
    //左上のコマ判定（-7）
    if(pieceSta[bjnum-7] === 2 && bjnum % 6 !== 1) {
        console.log('黒1_左上のコマ判定（-7）稼働');
        // BJMinus(bjnum,7);
        if(bjnum-7*2 > 0 && pieceSta[bjnum-7*2] !== 0 && (bjnum-7) % 6 !== 1) { //2つ先のコマが存在するか確認
            for(i = bjnum-7*2; i>=1 && i<=36 && pieceSta[i] !== 0 && i % 6 !== 0; i -= 7) { //2つ先以上のマスに、黒いコマがあるか順に確認していく。また、iが6の倍数になった場合、処理を終了させる（一番右のマスを対象に含めないようにするため）
                if(pieceSta[i] === 1) { //2つ先以上のマスについて、黒いコマがあれば稼働（※1）
                    blackAdd(bjnum-7); //1つ先のコマを黒にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i + 7; j < bjnum; j += 7) { //※1と※2の間に、白いコマがあればそちらも裏返す
                        if(pieceSta[j] === 2) {
                            blackAdd(j);
                        }
                        console.log(`BJMinus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`BJMinus-ikadou：${i}`); //確認用1
            }
        }
    }else{
        console.log('黒1_左上のコマ判定（-7）無し');
    }
    //上のコマ判定（-6）
    if(pieceSta[bjnum-6] === 2) {
        console.log('黒2_上のコマ判定（-6）稼働');
        // BJMinus(bjnum,6);
        if(bjnum-6*2 > 0 && pieceSta[bjnum-6*2] !== 0) { //2つ先のコマが存在するか確認
            for(i = bjnum-6*2; i>=1 && i<=36 && pieceSta[i] !== 0; i -= 6) { //2つ先以上のマスに、黒いコマがあるか順に確認していく
                if(pieceSta[i] === 1) { //2つ先以上のマスについて、黒いコマがあれば稼働（※1）
                    blackAdd(bjnum-6); //1つ先のコマを黒にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i + 6; j < bjnum; j += 6) { //※1と※2の間に、白いコマがあればそちらも裏返す
                        if(pieceSta[j] === 2) {
                            blackAdd(j);
                        }
                        console.log(`BJMinus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`BJMinus-ikadou：${i}`); //確認用1
            }
        }
    }else{
        console.log('黒2_上のコマ判定（-6）無し');
    }
    //右上のコマ判定（-5）
    if(pieceSta[bjnum-5] === 2 && bjnum % 6 !== 0) {
        console.log('黒3_右上のコマ判定（-5）稼働');
        // BJMinus(bjnum,5);
        if(bjnum-5*2 > 0 && pieceSta[bjnum-5*2] !== 0 && (bjnum-5) % 6 !== 0) { //2つ先のコマが存在するか確認
            for(i = bjnum-5*2; i>=1 && i<=36 && pieceSta[i] !== 0 && i % 6 !== 1; i -= 5) { //2つ先以上のマスに、黒いコマがあるか順に確認していく。また、iを6で割った余りが1になった場合、処理を終了させる（一番左のマスを対象に含めないようにするため）
                if(pieceSta[i] === 1) { //2つ先以上のマスについて、黒いコマがあれば稼働（※1）
                    blackAdd(bjnum-5); //1つ先のコマを黒にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i + 5; j < bjnum; j += 5) { //※1と※2の間に、白いコマがあればそちらも裏返す
                        if(pieceSta[j] === 2) {
                            blackAdd(j);
                        }
                        console.log(`BJMinus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`BJMinus-ikadou：${i}`); //確認用1
            }
        }
    }else{
        console.log('黒3_右上のコマ判定（-5）無し');
    }
    //左のコマ判定（-1）
    if(pieceSta[bjnum-1] === 2 && bjnum % 6 !== 1) {
        console.log('黒4_左のコマ判定（-1）稼働');
        if(bjnum -1*2 > 0 && pieceSta[bjnum -1*2] !== 0 && (bjnum -1*2)% 6 !== 0) { //2つ先のコマが存在するか確認
            console.log(`確認用：${(bjnum -1*2)% 6}`); //確認用
            for(i = bjnum - 1*2;  i % 6 !== 0 && pieceSta[i] !== 0; i -= 1) { //2つ先以上のマスに、黒いコマがあるか順に確認していく
                if(pieceSta[i] === 1) { //2つ先以上のマスについて、黒いコマがあれば稼働（※1）
                    blackAdd(bjnum-1); //1つ先のコマを黒にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i + 1; j < bjnum; j += 1) { //※1と※2の間に、白いコマがあればそちらも裏返す
                        if(pieceSta[j] === 2) {
                            blackAdd(j);
                        }
                        console.log(`BJMinus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`BJMinus-ikadou：${i}`); //確認用1
            }
        }
    }else{
        console.log('黒4_左のコマ判定（-1）無し');
    }
    //右のコマ判定（+1）
    if(pieceSta[bjnum+1] === 2 && bjnum % 6 !== 0) {
        console.log('黒5_右のコマ判定（+1）稼働');
        if(bjnum +1*2 <= 36 && pieceSta[bjnum +1*2] !== 0 && (bjnum +1*2) % 6 !== 1) { //2つ先のコマが存在するか確認
            console.log(`確認用：${(bjnum +1*2) % 6}`); //確認用
            for(i = bjnum + 1*2; i % 6 !== 1 && pieceSta[i] !== 0; i += 1) { //2つ先以上のマスに、黒いコマがあるか順に確認していく
                if(pieceSta[i] === 1) { //2つ先以上のマスについて、黒いコマがあれば稼働（※1）
                    blackAdd(bjnum + 1); //1つ先のコマを黒にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i - 1; j > bjnum; j -= 1) { //※1と※2の間に、白いコマがあればそちらも裏返す
                        if(pieceSta[j] === 2) {
                            blackAdd(j);
                        }
                        console.log(`BJPlus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`BJPlus-ikadou：${i}`); //確認用1
            }
        }
    }else{
        console.log('黒5_右のコマ判定（+1）無し');
    }
    //左下のコマ判定（+5）
    if(pieceSta[bjnum+5] === 2 && bjnum % 6 !== 1) {
        console.log('黒6_左下のコマ判定（+5）稼働');
        // BJPlus(bjnum,5);
        if(bjnum + 5*2 <= 36 && pieceSta[bjnum + 5*2] !== 0 && (bjnum+5) % 6 !== 1) { //2つ先のコマが存在するか確認
            for(i = bjnum + 5*2; i>=1 && i<=36 && pieceSta[i] !== 0 && i % 6 !== 0; i += 5) { //2つ先以上のマスに、黒いコマがあるか順に確認していく。また、iが6の倍数になった場合、処理を終了させる（一番右のマスを対象に含めないようにするため）
                if(pieceSta[i] === 1) { //2つ先以上のマスについて、黒いコマがあれば稼働（※1）
                    blackAdd(bjnum + 5); //1つ先のコマを黒にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i - 5; j > bjnum; j -= 5) { //※1と※2の間に、白いコマがあればそちらも裏返す
                        if(pieceSta[j] === 2) {
                            blackAdd(j);
                        }
                        console.log(`BJPlus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`BJPlus-ikadou：${i}`); //確認用1
            }
        }
    }else{
        console.log('黒6_左下のコマ判定（+5）無し');
    }
    //下のコマ判定（+6）
    if(pieceSta[bjnum+6] === 2) {
        console.log('黒7_下のコマ判定（+6）稼働');
        // BJPlus(bjnum,6);
        if(bjnum + 6*2 <= 36 && pieceSta[bjnum + 6*2] !== 0) { //2つ先のコマが存在するか確認
            for(i = bjnum + 6*2; i>=1 && i<=36 && pieceSta[i] !== 0; i += 6) { //2つ先以上のマスに、黒いコマがあるか順に確認していく
                if(pieceSta[i] === 1) { //2つ先以上のマスについて、黒いコマがあれば稼働（※1）
                    blackAdd(bjnum + 6); //1つ先のコマを黒にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i - 6; j > bjnum; j -= 6) { //※1と※2の間に、白いコマがあればそちらも裏返す
                        if(pieceSta[j] === 2) {
                            blackAdd(j);
                        }
                        console.log(`BJPlus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`BJPlus-ikadou：${i}`); //確認用1
            }
        }
    }else{
        console.log('黒7_下のコマ判定（+6）無し');
    }
    //右下のコマ判定（+7）
    if(pieceSta[bjnum+7] === 2 && bjnum % 6 !== 0) {
        console.log('黒8_右下のコマ判定（+7）稼働');
        // BJPlus(bjnum,7);
        if(bjnum + 7*2 <= 36 && pieceSta[bjnum + 7*2] !== 0 && (bjnum+7) % 6 !== 0) { //2つ先のコマが存在するか確認
            for(i = bjnum + 7*2; i>=1 && i<=36 && pieceSta[i] !== 0 && i % 6 !== 1; i += 7) { //2つ先以上のマスに、黒いコマがあるか順に確認していく。また、iを6で割った余りが1になった場合、処理を終了させる（一番左のマスを対象に含めないようにするため）
                if(pieceSta[i] === 1) { //2つ先以上のマスについて、黒いコマがあれば稼働（※1）
                    blackAdd(bjnum + 7); //1つ先のコマを黒にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i - 7; j > bjnum; j -= 7) { //※1と※2の間に、白いコマがあればそちらも裏返す
                        if(pieceSta[j] === 2) {
                            blackAdd(j);
                        }
                        console.log(`BJPlus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`BJPlus-ikadou：${i}`); //確認用1
            }
        }
    }else{
        console.log('黒8_右下のコマ判定（+7）無し');
    }
}

//裏返すかどうか判定（プレイヤー2用）
//pieceStaが1（黒）の場合作動
//引数部分には、置いたコマの位置が入る
function whiteJudge(whnum) {
    //左上のコマ判定（-7）
    if(pieceSta[whnum-7] === 1 && whnum % 6 !== 1) {
        console.log('白1_左上のコマ判定（-7）稼働');
        // WJMinus(whnum,7);
        if(whnum - 7*2 > 0 && pieceSta[whnum - 7*2] !== 0 && (whnum - 7) % 6 !== 1) { //2つ先のコマが存在するか確認
            for(i = whnum - 7*2; i>=1 && i<=36 && pieceSta[i] !== 0 && i % 6 !== 0; i -= 7) { //2つ先以上のマスに、白いコマがあるか順に確認していく。また、iが6の倍数になった場合、処理を終了させる（一番右のマスを対象に含めないようにするため）
                if(pieceSta[i] === 2) { //2つ先以上のマスについて、白いコマがあれば稼働（※1）
                    console.log(whnum - 7); //確認用1
                    whiteAdd(whnum - 7); //1つ先のコマを白にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i + 7; j < whnum; j += 7) { //※1と※2の間に、黒いコマがあればそちらも裏返す
                        if(pieceSta[j] === 1) {
                            whiteAdd(j);
                        }
                        console.log(`WJMinus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`WJMinus-ikadou：${i}`); //確認用3
            }
        }
    }else{
        console.log('白1_左上のコマ判定（-7）無し');
    }
    //上のコマ判定（-6）
    if(pieceSta[whnum-6] === 1) {
        console.log('白2_上のコマ判定（-6）稼働');
        // WJMinus(whnum,6);
        if(whnum - 6*2 > 0 && pieceSta[whnum - 6*2] !== 0) { //2つ先のコマが存在するか確認
            for(i = whnum - 6*2; i>=1 && i<=36 && pieceSta[i] !== 0; i -= 6) { //2つ先以上のマスに、白いコマがあるか順に確認していく
                if(pieceSta[i] === 2) { //2つ先以上のマスについて、白いコマがあれば稼働（※1）
                    console.log(whnum - 6); //確認用1
                    whiteAdd(whnum - 6); //1つ先のコマを白にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i + 6; j < whnum; j += 6) { //※1と※2の間に、黒いコマがあればそちらも裏返す
                        if(pieceSta[j] === 1) {
                            whiteAdd(j);
                        }
                        console.log(`WJMinus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`WJMinus-ikadou：${i}`); //確認用3
            }
        }
    }else{
        console.log('白2_上のコマ判定（-6）無し');
    }
    //右上のコマ判定（-5）
    if(pieceSta[whnum-5] === 1 && whnum % 6 !== 0) {
        console.log('白3_右上のコマ判定（-5）稼働');
        // WJMinus(whnum,5);
        if(whnum - 5*2 > 0 && pieceSta[whnum - 5*2] !== 0 && (whnum-5) % 6 !== 0) { //2つ先のコマが存在するか確認
            for(i = whnum - 5*2; i>=1 && i<=36 && pieceSta[i] !== 0 && i % 6 !== 1; i -= 5) { //2つ先以上のマスに、白いコマがあるか順に確認していく。また、iを6で割った余りが1になった場合、処理を終了させる（一番左のマスを対象に含めないようにするため）
                if(pieceSta[i] === 2) { //2つ先以上のマスについて、白いコマがあれば稼働（※1）
                    console.log(whnum - 5); //確認用1
                    whiteAdd(whnum - 5); //1つ先のコマを白にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i + 5; j < whnum; j += 5) { //※1と※2の間に、黒いコマがあればそちらも裏返す
                        if(pieceSta[j] === 1) {
                            whiteAdd(j);
                        }
                        console.log(`WJMinus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`WJMinus-ikadou：${i}`); //確認用3
            }
        }
    }else{
        console.log('白3_右上のコマ判定（-5）無し');
    }
    //左のコマ判定（-1）
    if(pieceSta[whnum-1] === 1 && whnum % 6 !== 1) {
        console.log('白4_左のコマ判定（-1）稼働');
        if(whnum-1*2 > 0 && pieceSta[whnum-1*2] !== 0 && (whnum-1*2)% 6 !== 0) { //2つ先のコマが存在するか確認
            console.log(`確認用：${(whnum-1*2)% 6}`);
            for(i = whnum - 1*2; i % 6 !== 0 && pieceSta[i] !== 0; i -= 1) { //2つ先以上のマスに、白いコマがあるか順に確認していく
                if(pieceSta[i] === 2) { //2つ先以上のマスについて、白いコマがあれば稼働（※1）
                    console.log(whnum - 1); //確認用1
                    whiteAdd(whnum - 1); //1つ先のコマを白にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i + 1; j < whnum; j += 1) { //※1と※2の間に、黒いコマがあればそちらも裏返す
                        if(pieceSta[j] === 1) {
                            whiteAdd(j);
                        }
                        console.log(`WJMinus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`WJMinus-ikadou：${i}`); //確認用3
            }
        }
    }else{
        console.log('白4_左のコマ判定（-1）無し');
    }
    //右のコマ判定（+1）
    if(pieceSta[whnum+1] === 1 && whnum % 6 !== 0) {
        console.log('白5_右のコマ判定（+1）稼働');
        if(whnum+1*2 <= 36 && pieceSta[whnum+1*2] !== 0 &&(whnum+1*2)% 6 !== 1) { //2つ先のコマが存在するか確認
            console.log(`確認用：${(whnum+1*2)% 6}`);
            for(i = whnum + 1*2; i % 6 !== 1 && pieceSta[i] !== 0; i += 1) { //2つ先以上のマスに、白いコマがあるか順に確認していく
                if(pieceSta[i] === 2) { //2つ先以上のマスについて、白いコマがあれば稼働（※1）
                    console.log(whnum + 1); //確認用1
                    whiteAdd(whnum + 1); //1つ先のコマを白にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i - 1; j > whnum; j -= 1) { //※1と※2の間に、黒いコマがあればそちらも裏返す
                        if(pieceSta[j] === 1) {
                            whiteAdd(j);
                        }
                        console.log(`WJPlus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`WJPlus-ikadou：${i}`); //確認用3
            }
        }
    }else{
        console.log('白5_右のコマ判定（+1）無し');
    }
    //左下のコマ判定（+5）
    if(pieceSta[whnum+5] === 1 && whnum % 6 !== 1) {
        console.log('白6_左下のコマ判定（+5）稼働');
        // WJPlus(whnum,5);
        if(whnum + 5*2 <= 36 && pieceSta[whnum + 5*2] !== 0 && (whnum + 5) % 6 !== 1) { //2つ先のコマが存在するか確認
            for(i = whnum + 5*2; i>=1 && i<=36 && pieceSta[i] !== 0 && i % 6 !== 0; i += 5) { //2つ先以上のマスに、白いコマがあるか順に確認していく。また、iが6の倍数になった場合、処理を終了させる（一番右のマスを対象に含めないようにするため）
                if(pieceSta[i] === 2) { //2つ先以上のマスについて、白いコマがあれば稼働（※1）
                    console.log(whnum + 5); //確認用1
                    whiteAdd(whnum + 5); //1つ先のコマを白にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i - 5; j > whnum; j -= 5) { //※1と※2の間に、黒いコマがあればそちらも裏返す
                        if(pieceSta[j] === 1) {
                            whiteAdd(j);
                        }
                        console.log(`WJPlus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`WJPlus-ikadou：${i}`); //確認用3
            }
        }
    }else{
        console.log('白6_左下のコマ判定（+5）無し');
    }
    //下のコマ判定（+6）
    if(pieceSta[whnum+6] === 1) {
        console.log('白7_下のコマ判定（+6）稼働');
        // WJPlus(whnum,6);
        if(whnum + 6*2 <= 36 && pieceSta[whnum + 6*2] !== 0) { //2つ先のコマが存在するか確認
            for(i = whnum + 6*2; i>=1 && i<=36 && pieceSta[i] !== 0; i += 6) { //2つ先以上のマスに、白いコマがあるか順に確認していく
                if(pieceSta[i] === 2) { //2つ先以上のマスについて、白いコマがあれば稼働（※1）
                    console.log(whnum + 6); //確認用1
                    whiteAdd(whnum + 6); //1つ先のコマを白にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i - 6; j > whnum; j -= 6) { //※1と※2の間に、黒いコマがあればそちらも裏返す
                        if(pieceSta[j] === 1) {
                            whiteAdd(j);
                        }
                        console.log(`WJPlus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`WJPlus-ikadou：${i}`); //確認用3
            }
        }
    }else{
        console.log('白7_下のコマ判定（+6）無し');
    }
    //右下のコマ判定（+7）
    if(pieceSta[whnum+7] === 1 && whnum % 6 !== 0) {
        console.log('白8_右下のコマ判定（+7）稼働');
        // WJPlus(whnum,7);
        if(whnum + 7*2 <= 36 && pieceSta[whnum + 7*2] !== 0 && (whnum + 7) % 6 !== 0) { //2つ先のコマが存在するか確認
            for(i = whnum + 7*2; i>=1 && i<=36 && pieceSta[i] !== 0 && i % 6 !== 1; i += 7) { //2つ先以上のマスに、白いコマがあるか順に確認していく。また、iを6で割った余りが1になった場合、処理を終了させる（一番左のマスを対象に含めないようにするため）
                if(pieceSta[i] === 2) { //2つ先以上のマスについて、白いコマがあれば稼働（※1）
                    console.log(whnum + 7); //確認用1
                    whiteAdd(whnum + 7); //1つ先のコマを白にする（※2）
                    placeable = 1; //裏返すコマがあるので1に変更
                    for(j = i - 7; j > whnum; j -= 7) { //※1と※2の間に、黒いコマがあればそちらも裏返す
                        if(pieceSta[j] === 1) {
                            whiteAdd(j);
                        }
                        console.log(`WJPlus-jkadou：${j}`); //確認用2
                    }
                    break;
                }
                console.log(`WJPlus-ikadou：${i}`); //確認用3
            }
        }
    }else{
        console.log('白8_右下のコマ判定（+7）無し');
    }
}