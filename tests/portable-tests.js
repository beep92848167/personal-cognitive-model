const {test,assertEqual,assertDeepEqual}=OpenPCMTest;

test("buildExportPayload wraps evidence",["REQ-PORTABLE-001"],()=>{
 const out=OpenPCMPortable.buildExportPayload([{id:1}],"2026");
 assertEqual(out.schema_version,OpenPCMPortable.SCHEMA);
 assertEqual(out.exported_utc,"2026");
 assertDeepEqual(out.evidence,[{id:1}]);
});

test("extractEvidence accepts array",["REQ-PORTABLE-002"],()=>{
 const arr=[{id:2}];
 assertDeepEqual(OpenPCMPortable.extractEvidence(arr),arr);
});

test("extractEvidence accepts export object",["REQ-PORTABLE-002"],()=>{
 const arr=[{id:3}];
 assertDeepEqual(OpenPCMPortable.extractEvidence({evidence:arr}),arr);
});
