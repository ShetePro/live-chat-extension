import { BasicIndexDb } from "../modules/indexDb.js";

const indexDb = new BasicIndexDb();


function setLiveHeader() {
  indexDb
    .getPageBySiteType({
      pageSize: 10,
      pageIndex: 1,
      liveId: "5194110",
      siteType: "1",
    })
    .then((res) => {
      console.log(res, "list");
    });
}
