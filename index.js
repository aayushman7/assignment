const express = require("express")
const app = express();

app.use(express.json());


let balance = function(balanceSheet, objects, add = 1){
  objects.map(function(item) {
    if (balanceSheet[item["startDate"]] == undefined){
      balanceSheet[item["startDate"]] = add * item["amount"];
    }
    else{
      balanceSheet[item["startDate"]] += add * item["amount"];
    }
  });
}


let formatBalanceSheet = function(balanceSheet) {
  let formatted = {"balance":[]};
  for (const item in balanceSheet) {
    formatted.balance.push({"amount": balanceSheet[item], "startDate":item});
  }
  return formatted;
}


let sortAndFill = function(balanceSheet) {
  balanceSheet.balance.sort(function(a,b) {
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  });

  let lastDate = 0;
  filledSheet = []
  let i = 0;
  let startLegth = balanceSheet.balance.length;
  while(i<startLegth){
    if (filledSheet.length == 0) {
      filledSheet.push(balanceSheet.balance[i]);
      lastDate = new Date(balanceSheet.balance[i].startDate);
      i += 1;
      continue;
    }
    else{
      let thisDate = new Date(balanceSheet.balance[i].startDate);
      if (thisDate.getMonth() != lastDate.getMonth()+1){
        lastDate = new Date(lastDate.setMonth(lastDate.getMonth()+1)).toISOString();
        filledSheet.push({"amount":0, "startDate":lastDate });
        lastDate = new Date(lastDate);
      }
      else{
        filledSheet.push(balanceSheet.balance[i]);
        lastDate = new Date(balanceSheet.balance[i].startDate);
        i += 1;
      }
    }
  }

  balanceSheet.balance = filledSheet;

}


app.post('/',  function(request, response){
  data = request.body;      // your JSON
  balanceSheet = {};
  balance(balanceSheet, data["expenseData"], -1);
  balance(balanceSheet, data["revenueData"], 1);

  formattedSheet = formatBalanceSheet(balanceSheet);
  sortAndFill(formattedSheet);
   response.send(formattedSheet);    // echo the result back
});


app.listen("5000",()=>{
  console.log("Port is running at port 5000");
});
