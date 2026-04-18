// @ts-nocheck
/**
 * PlayHeaderEditor - extracted verbatim from reference.html MODULE:
 * PlayHeaderEditor. All design tokens (T1/T2/T3/SURF/BG/mc/SH_SM/docFont)
 * arrive via props from EditorScreen, matching the reference signature, so
 * this component does not need to import from src/legacy/ui/tokens directly.
 *
 * The new reference adds `arrowOffsetX`, `searchScope`, and
 * `renderSearchOverlay` props to thread editor-search highlights through the
 * header rows; all still optional so existing callers keep working.
 */
import React from "react";

export function PlayHeaderEditor({ items, setItems, focKey, setFocKey, T1, T2, T3, SURF, BG, mc, SH_SM, docFont, arrowOffsetX=0, searchScope=null, renderSearchOverlay=null }) {
  const onChange = (key, field, val) =>
    setItems(ph => ph.map(item => item.key===key ? {...item,[field]:val} : item));

  const delItem = (key) => setItems(ph => ph.filter(i=>i.key!==key));

  const addItem = () => setItems(ph => [...ph, {
    key:"h_"+Date.now(), label:"Новый блок", text:"", align:"left", font:"Times New Roman", size:14
  }]);

  const addSpacer = () => setItems(ph => [...ph, {
    key:"sp_"+Date.now(), type:"spacer", size:24
  }]);

  const moveItem = (key, dir) => {
    setItems(ph => {
      const i = ph.findIndex(x=>x.key===key);
      const j = i + dir;
      if (j < 0 || j >= ph.length) return ph;
      const next = [...ph];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  // Alignment SVG icons
  const AlignIcon = ({type, active}) => {
    const c = active ? "#fff" : T3;
    const lines = type==="left"
      ? [[2,4,14,4],[2,7,10,7],[2,10,14,10],[2,13,8,13]]
      : type==="center"
      ? [[3,4,13,4],[5,7,11,7],[3,10,13,10],[5,13,11,13]]
      : [[2,4,14,4],[6,7,14,7],[2,10,14,10],[8,13,14,13]];
    return (
      <svg width="16" height="17" viewBox="0 0 16 17" fill="none">
        {lines.map(([x1,y1,x2,y2],i)=>
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
        )}
      </svg>
    );
  };

  return (
    <div style={{marginBottom:"32px", paddingBottom:"24px", borderBottom:`1px solid ${T3}22`}}>
      {items.map((item, idx) => (
        item.type==="spacer" ? (
          <div key={item.key} style={{display:"flex",alignItems:"center",padding:"2px 6px",marginBottom:"4px",marginLeft:`${arrowOffsetX}px`}}>
            <div style={{flex:1,height:`${item.size||24}px`,borderRadius:"4px",background:T3+"18",
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:T3,fontSize:"9px",letterSpacing:"2px"}}>ОТСТУП</span>
            </div>
            <div style={{display:"flex",flexDirection:"column"}}>
              <button onMouseDown={e=>e.preventDefault()} onClick={()=>setItems(ph=>ph.map(i=>i.key===item.key?{...i,size:Math.min(120,(i.size||24)+8)}:i))}
                style={{background:"transparent",border:"none",color:T3,fontSize:"11px",cursor:"pointer",padding:"1px 3px",lineHeight:1}}>▲</button>
              <button onMouseDown={e=>e.preventDefault()} onClick={()=>setItems(ph=>ph.map(i=>i.key===item.key?{...i,size:Math.max(8,(i.size||24)-8)}:i))}
                style={{background:"transparent",border:"none",color:T3,fontSize:"11px",cursor:"pointer",padding:"1px 3px",lineHeight:1}}>▼</button>
            </div>
            <button onMouseDown={e=>e.preventDefault()} onClick={()=>setItems(ph=>ph.filter(i=>i.key!==item.key))}
              style={{background:"#f8717108",border:"1px solid #f8717118",borderRadius:"6px",color:"#f87171",fontSize:"14px",cursor:"pointer",padding:"3px 7px",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg></button>
          </div>
        ) : (
        <div key={item.key} style={{marginBottom:"6px", borderRadius:"8px",
          background: focKey===item.key ? `${mc}08` : "transparent", transition:"background .15s"}}>
          <div style={{display:"flex", alignItems:"flex-start", padding:"4px 6px"}}>
            {/* Up/Down */}
            <div style={{display:"flex",flexDirection:"column",paddingTop:"4px",flexShrink:0,marginLeft:`${arrowOffsetX}px`}}>
              <button onMouseDown={e=>e.preventDefault()} onClick={()=>moveItem(item.key,-1)}
                disabled={idx===0}
                style={{background:"transparent",border:"none",color:idx===0?T3+"44":T3,
                  fontSize:"11px",cursor:idx===0?"default":"pointer",padding:"1px 3px",lineHeight:1}}>▲</button>
              <button onMouseDown={e=>e.preventDefault()} onClick={()=>moveItem(item.key,1)}
                disabled={idx===items.length-1}
                style={{background:"transparent",border:"none",color:idx===items.length-1?T3+"44":T3,
                  fontSize:"11px",cursor:idx===items.length-1?"default":"pointer",padding:"1px 3px",lineHeight:1}}>▼</button>
            </div>
            {/* Textarea */}
            <div style={{position:"relative", flex:1}}>
              {typeof renderSearchOverlay === "function" && renderSearchOverlay({
                scope:"header",
                headerScope:searchScope,
                headerKey:item.key,
                text:item.text,
                overlayStyle:{
                  boxSizing:"border-box",
                  padding:"4px 0",
                  fontFamily:docFont||"Times New Roman",
                  fontSize:item.size+"px",
                  fontWeight:item.bold ? "bold" : "normal",
                  fontStyle:item.italic ? "italic" : "normal",
                  textDecoration:item.underline ? "underline" : "none",
                  textAlign:item.align,
                  lineHeight:"1.5",
                }
              })}
              <textarea
                value={item.text}
                placeholder={item.label}
                data-header-scope={searchScope||undefined}
                data-header-key={item.key}
                onFocus={()=>setFocKey(item.key)}
                onChange={e=>onChange(item.key,"text",e.target.value)}
                rows={1}
                onInput={e=>{ e.target.style.height="auto"; e.target.style.height=e.target.scrollHeight+"px"; }}
                style={{
                  width:"100%", display:"block", position:"relative", zIndex:1,
                  background:"transparent", border:"none",
                  borderBottom: focKey===item.key ? `1px solid ${mc}66` : `1px solid ${T3}22`,
                  outline:"none", resize:"none", overflow:"hidden",
                  fontFamily: docFont||"Times New Roman",
                  fontSize:item.size+"px",
                  fontWeight: item.bold ? "bold" : "normal",
                  fontStyle: item.italic ? "italic" : "normal",
                  textDecoration: item.underline ? "underline" : "none",
                  textAlign:item.align, color:T1,
                  padding:"4px 0", lineHeight:"1.5", transition:"border .15s",
                }}
              />
            </div>
            {/* Duplicate + Delete */}
            <div style={{display:"flex",flexShrink:0,marginTop:"2px"}}>
              <button onMouseDown={e=>e.preventDefault()} onClick={()=>setItems(ph=>{
                const i=ph.findIndex(x=>x.key===item.key);
                const copy={...item,key:"h_"+Date.now()};
                return [...ph.slice(0,i+1),copy,...ph.slice(i+1)];
              })} style={{
                background:`${mc}11`, border:`1px solid ${mc}33`,
                borderRadius:"6px", color:mc, fontSize:"13px",
                cursor:"pointer", padding:"3px 7px",
              }}>⧉</button>
              <button onMouseDown={e=>e.preventDefault()} onClick={()=>delItem(item.key)} style={{
                background:"#f8717108", border:"1px solid #f8717118",
                borderRadius:"6px", color:"#f87171", fontSize:"14px",
                cursor:"pointer", padding:"3px 7px",
                display:"flex",alignItems:"center",justifyContent:"center",
              }}><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"><line x1="1" y1="1" x2="7" y2="7"/><line x1="7" y1="1" x2="1" y2="7"/></svg></button>
            </div>
          </div>
          {/* Settings panel — visible when focused */}
          {focKey===item.key && (
            <div style={{display:"flex", alignItems:"center",
              padding:"6px 6px 8px 32px", flexWrap:"wrap"}}>
              {/* Align icons */}
              {["left","center","right"].map(a=>(
                <button key={a} onMouseDown={e=>e.preventDefault()}
                  onClick={()=>onChange(item.key,"align",a)} style={{
                  padding:"5px 7px", borderRadius:"6px", border:"none", cursor:"pointer",
                  background: item.align===a ? mc : SURF,
                  boxShadow: SH_SM, display:"flex", alignItems:"center",
                }}>
                  <AlignIcon type={a} active={item.align===a}/>
                </button>
              ))}
              <div style={{width:"1px",height:"20px",background:T3+"33"}}/>
              {/* Style: Б К Ч */}
              {[
                {field:"bold",      label:"Ж", style:{fontWeight:"bold"}},
                {field:"italic",    label:"К", style:{fontStyle:"italic"}},
                {field:"underline", label:"Ч", style:{textDecoration:"underline"}},
              ].map(({field,label,style})=>(
                <button key={field} onMouseDown={e=>e.preventDefault()}
                  onClick={()=>onChange(item.key, field, !item[field])} style={{
                  padding:"4px 9px", borderRadius:"6px", border:"none", cursor:"pointer",
                  background: item[field] ? mc : SURF,
                  color: item[field] ? "#fff" : T2,
                  fontSize:"13px", boxShadow:SH_SM, ...style,
                }}>{label}</button>
              ))}
              {/* Size */}
              <div style={{display:"flex",alignItems:"center"}}>
                <button onMouseDown={e=>e.preventDefault()}
                  onClick={()=>onChange(item.key,"size",Math.max(10,item.size-1))} style={{
                  padding:"2px 8px",borderRadius:"6px",border:"none",cursor:"pointer",
                  background:SURF,color:T1,fontSize:"14px",boxShadow:SH_SM,
                }}>−</button>
                <span style={{color:T2,fontSize:"11px",minWidth:"24px",textAlign:"center"}}>{item.size}</span>
                <button onMouseDown={e=>e.preventDefault()}
                  onClick={()=>onChange(item.key,"size",Math.min(48,item.size+1))} style={{
                  padding:"2px 8px",borderRadius:"6px",border:"none",cursor:"pointer",
                  background:SURF,color:T1,fontSize:"14px",boxShadow:SH_SM,
                }}>+</button>
              </div>
            </div>
          )}
        </div>
        )
      ))}
      <button onClick={addItem} style={{
        marginTop:"8px", padding:"8px 16px",
        background:`${mc}11`, border:`1px solid ${mc}33`,
        borderRadius:"8px", color:mc, fontSize:"12px",
        cursor:"pointer", letterSpacing:"1px",
      }}>+ ДОБАВИТЬ БЛОК</button>
      <button onClick={addSpacer} style={{
        marginTop:"8px", marginLeft:"8px", padding:"8px 16px",
        background:T3+"18", border:`1px solid ${T3}33`,
        borderRadius:"8px", color:T2, fontSize:"12px",
        cursor:"pointer", letterSpacing:"1px",
      }}>+ ОТСТУП</button>
    </div>
  );
}
