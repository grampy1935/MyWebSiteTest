const fullFetch = process.argv[2] === "true"; // 空文字やundefinedなら false 扱い
console.log("DEBUG: argv:", process.argv);
console.log("DEBUG: process.argv[2] =", process.argv[2]);
console.log("DEBUG fullFetch:", fullFetch);

