(function(global){
const SCHEMA="openpcm_mobile_export_v4";
function buildExportPayload(entries, now=new Date().toISOString()){
 return {schema_version:SCHEMA,exported_utc:now,evidence:entries};
}
function extractEvidence(data){
 if(Array.isArray(data)) return data;
 if(data&&Array.isArray(data.evidence)) return data.evidence;
 throw new Error("No evidence array found.");
}
global.OpenPCMPortable={SCHEMA,buildExportPayload,extractEvidence};
})(window);
