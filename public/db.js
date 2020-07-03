// check for indexedDB browser support
const request = window.indexedDB.open("budget", 1);
let db;
request.onupgradeneeded = function (event) {
  // create a new db request for a "budget" database.
  const db = event.target.result;

  const budgetStore = db.createObjectStore("budget", {
    // create object store called "pending" and set autoIncrement to true
    autoIncrement: true //Key Primary key identifier for your ofject store

  });

};
request.onerror = function (event) {
  // log error here
  console.log(event);
};

request.onsuccess = function ({ target }) {
  db = target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  // access your pending object store
  // add record to your store with add method.
  console.log(db);
  const transaction = db.transaction(["budget"], "readwrite");
  const objectStore = transaction.objectStore("budget");
  objectStore.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  // access your pending object store
  // get all records from store and set to a variable
  const transaction = db.transaction(["budget"], "readwrite");
  const objectStore = transaction.objectStore("budget");
  const getAll = objectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {

          // if successful, open a transaction on your pending db
          // access your pending object store
          // clear all items in your store
          const transaction = db.transaction(["budget"], "readwrite");

          const objectStore = transaction.objectStore("budget");
          objectStore.clear();
        });
    }
  };
}
// listen for app coming back online
window.addEventListener("online", checkDatabase);