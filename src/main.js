
import { createClient } from "@supabase/supabase-js";
import { toJalaali, toGregorian, jalaaliMonthLength } from "jalaali-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
import "./style.css";

const classes = [
["101","دهم ریاضی ۱","دهم"],["102","دهم ریاضی ۲","دهم"],["103","دهم تجربی ۱","دهم"],["104","دهم تجربی ۲","دهم"],["105","دهم تجربی ۳","دهم"],["106","دهم تجربی ۴","دهم"],["107","دهم ادبیات","دهم"],
["111","یازدهم ریاضی ۱","یازدهم"],["112","یازدهم ریاضی ۲","یازدهم"],["113","یازدهم تجربی ۱","یازدهم"],["114","یازدهم تجربی ۲","یازدهم"],["115","یازدهم تجربی ۳","یازدهم"],["116","یازدهم تجربی ۴","یازدهم"],["117","یازدهم ادبیات","یازدهم"],
["121","دوازدهم ریاضی ۱","دوازدهم"],["122","دوازدهم ریاضی ۲","دوازدهم"],["123","دوازدهم تجربی ۱","دوازدهم"],["124","دوازدهم تجربی ۲","دوازدهم"],["125","دوازدهم تجربی ۳","دوازدهم"],["126","دوازدهم ادبیات","دوازدهم"]];
const names=["","فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"];
const fa=n=>new Intl.NumberFormat("fa-IR").format(n), faDigits=s=>String(s).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[Number(d)]), $=s=>document.querySelector(s);
const now=toJalaali(new Date()); let jy=now.jy,jm=now.jm, selected=new URLSearchParams(location.search).get("class"), exams=[], editId=null, sb=null;
const configured=!SUPABASE_URL.includes("YOUR-PROJECT")&&!SUPABASE_ANON_KEY.includes("YOUR_");
if(configured) sb=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const cls=id=>classes.find(c=>c[0]===id);
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function iso(y,m,d){const g=toGregorian(y,m,d);return `${g.gy}-${String(g.gm).padStart(2,"0")}-${String(g.gd).padStart(2,"0")}`;}
function parts(s){const [y,m,d]=s.split("-").map(Number);return toJalaali(y,m,d);}
function msg(t,err=false){const e=$("#msg");if(e){e.textContent=t;e.className=err?"error":"message";}}
function shell(){const c=cls(selected);$("#app").innerHTML=`
<header><div><strong>دبیرستان دوره دوم استعدادهای درخشان شهید اژه‌ای یک</strong><small>سامانه تقویم امتحانات</small></div><button id="admin">پنل مسئول امتحانات</button></header>
<main>${!configured?'<aside><b>اتصال پایگاه داده تنظیم نشده است.</b> راهنمای راه‌اندازی در فایل README آمده است.</aside>':''}
<section class="intro"><small>تقویم رسمی مدرسه</small><h1>${c?"تقویم امتحانات "+c[1]:"انتخاب کلاس برای مشاهده تقویم"}</h1><p>${c?"برنامه امتحانات این کلاس را در تقویم شمسی ببینید.":"هر کلاس صفحه و نشانی اختصاصی خود را دارد."}</p></section>
${c?`<nav><button id="back">بازگشت به کلاس‌ها</button><div><button id="prev">ماه قبل</button><b>${names[jm]} ${fa(jy)}</b><button id="next">ماه بعد</button></div></nav><div id="calendar" class="calendar"></div>`:
`<section class="groups">${["دهم","یازدهم","دوازدهم"].map(g=>`<div><h2>پایه ${g}</h2><div class="cards">${classes.filter(c=>c[2]===g).map(c=>`<a href="?class=${c[0]}"><b>${c[1]}</b><small>مشاهده تقویم ←</small></a>`).join("")}</div></div>`).join("")}</section>`}
<section id="adminPanel" class="panel hidden"></section><p id="msg"></p></main><footer>دبیرستان شهید اژه‌ای یک اصفهان</footer>`;
$("#admin").onclick=adminPanel;
if(c){$("#back").onclick=()=>location.href=location.pathname;$("#prev").onclick=()=>{jm--;if(jm<1){jm=12;jy--;}calendar();};$("#next").onclick=()=>{jm++;if(jm>12){jm=1;jy++;}calendar();};calendar();}
}
function calendar(){
 const offset=(new Date(iso(jy,jm,1)+"T12:00:00").getDay()+1)%7, days=jalaaliMonthLength(jy,jm);
 let h=["شنبه","یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه"].map(x=>`<div class="weekday">${x}</div>`).join("");
 for(let i=0;i<offset;i++)h+='<div class="day blank"></div>';
 for(let d=1;d<=days;d++){const e=exams.find(x=>x.exam_date===iso(jy,jm,d));h+=`<div class="day ${e?"has":""}"><b>${fa(d)}</b>${e?`<article><strong>${safe(e.subject)}</strong><small>${faDigits(e.exam_time.slice(0,5))}</small>${e.description?`<small>${safe(e.description)}</small>`:""}</article>`:""}</div>`;}
  $("nav b").textContent=`${names[jm]} ${fa(jy)}`;
 $("#calendar").innerHTML=h;
}
async function load(){if(!sb||!selected)return;const {data,error}=await sb.from("exams").select("*").eq("class_id",selected).order("exam_date");if(error)msg("خطا در دریافت تقویم: "+error.message,true);else{exams=data||[];calendar();}}
async function adminPanel(){
 const p=$("#adminPanel");p.classList.remove("hidden");
 if(!sb){p.innerHTML="<h2>پنل مدیریت</h2><p>ابتدا اتصال Supabase را در src/config.js تنظیم کنید.</p>";return;}
 const {data:{session}}=await sb.auth.getSession();
 if(!session){p.innerHTML=`<h2>ورود مسئول امتحانات</h2><form id="login"><label>ایمیل<input name="email" type="email" required></label><label>رمز عبور<input name="password" type="password" required></label><button>ورود</button></form>`;
 $("#login").onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),r=await sb.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});if(r.error)msg("ورود ناموفق: "+r.error.message,true);else adminPanel();};return;}
 p.innerHTML=`<div class="between"><h2>مدیریت امتحانات</h2><button id="logout">خروج</button></div>
 <form id="examForm"><label>کلاس<select name="class_id">${classes.map(c=>`<option value="${c[0]}" ${c[0]===selected?"selected":""}>${c[1]}</option>`).join("")}</select></label>
 <label>سال شمسی<input name="year" type="number" min="1300" max="1500" value="${jy}" required></label><label>ماه<select name="month">${names.slice(1).map((n,i)=>`<option value="${i+1}" ${i+1===jm?"selected":""}>${n}</option>`).join("")}</select></label>
 <label>روز<input name="day" type="number" min="1" max="31" value="1" required></label><label>نام درس<input name="subject" required maxlength="100"></label><label>ساعت<input name="exam_time" type="time" value="08:00" required></label><label>توضیحات اختیاری<textarea name="description"></textarea></label><button>ذخیره امتحان</button><button type="button" id="cancel" class="secondary hidden">لغو ویرایش</button></form><h3>امتحانات این کلاس</h3><div id="list"></div>`;
 $("#logout").onclick=async()=>{await sb.auth.signOut();adminPanel();};
 $("#examForm").onsubmit=save;
 $("#cancel").onclick=()=>{editId=null;$("#examForm").reset();$("#cancel").classList.add("hidden");};
 renderList();
}
async function save(e){
 e.preventDefault();const f=new FormData(e.target),y=+f.get("year"),m=+f.get("month"),d=+f.get("day");
 if(d<1||d>jalaaliMonthLength(y,m)){msg("تاریخ واردشده معتبر نیست.",true);return;}
 const record={class_id:f.get("class_id"),exam_date:iso(y,m,d),subject:f.get("subject").trim(),exam_time:f.get("exam_time"),description:f.get("description").trim()||null};
 const r=editId?await sb.from("exams").update(record).eq("id",editId):await sb.from("exams").insert(record);
 if(r.error){msg(r.error.code==="23505"?"برای این کلاس در این روز امتحان دیگری ثبت شده است؛ آن را ویرایش یا حذف کنید.":"خطا: "+r.error.message,true);return;}
 editId=null;selected=record.class_id;history.replaceState(null,"","?class="+selected);jy=y;jm=m;
 const q=await sb.from("exams").select("*").eq("class_id",selected).order("exam_date");exams=q.data||[];shell();adminPanel();msg("اطلاعات با موفقیت ذخیره شد.");
}
function renderList(){const el=$("#list");if(!el)return;el.innerHTML=exams.map(e=>{const p=parts(e.exam_date);return `<div class="item"><span><b>${safe(e.subject)}</b><small>${fa(p.jd)} ${names[p.jm]} ${fa(p.jy)} — ${faDigits(e.exam_time.slice(0,5))}</small></span><span><button data-edit="${e.id}">ویرایش</button><button data-delete="${e.id}" class="red">حذف</button></span></div>`}).join("")||"<p>امتحانی ثبت نشده است.</p>";
el.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const e=exams.find(x=>String(x.id)===b.dataset.edit),p=parts(e.exam_date),f=$("#examForm");editId=e.id;for(const [k,v] of Object.entries({class_id:e.class_id,year:p.jy,month:p.jm,day:p.jd,subject:e.subject,exam_time:e.exam_time.slice(0,5),description:e.description||""}))f.elements[k].value=v;$("#cancel").classList.remove("hidden");});
el.querySelectorAll("[data-delete]").forEach(b=>b.onclick=async()=>{const e=exams.find(x=>String(x.id)===b.dataset.delete);if(!confirm("این امتحان حذف شود؟"))return;const r=await sb.from("exams").delete().eq("id",e.id);if(r.error)msg(r.error.message,true);else{exams=exams.filter(x=>x.id!==e.id);calendar();renderList();msg("امتحان حذف شد.");}});
}
shell();if(selected&&!cls(selected)){selected=null;shell();}else if(selected)load();
