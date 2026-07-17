export const S = {
  page: { minHeight: "100vh", background: "#F5F7F6", display: "flex", justifyContent: "center", padding: "18px 12px" },
  shell: { width: "100%", maxWidth: 440, background: "#FFFFFF", borderRadius: 20, border: "1px solid #E1E8E7", overflow: "hidden", boxShadow: "0 1px 2px rgba(15,58,68,0.04), 0 12px 28px rgba(15,58,68,0.06)", height: "fit-content" },
  shellWide: { width: "100%", maxWidth: 640, background: "#FFFFFF", borderRadius: 20, border: "1px solid #E1E8E7", overflow: "hidden", boxShadow: "0 1px 2px rgba(15,58,68,0.04), 0 12px 28px rgba(15,58,68,0.06)", height: "fit-content" },

  header: { padding: "16px 20px 0", borderBottom: "1px solid #EEF2F1" },
  headerTop: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14 },
  brandRow: { display: "flex", alignItems: "center", gap: 8 },
  logoDot: { width: 9, height: 9, borderRadius: 3, background: "linear-gradient(135deg,#17A673,#0F3A44)" },
  brandText: { fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", color: "#0F3A44" },
  cityPill: { display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#0F3A44", background: "#EEF6F3", padding: "5px 10px", borderRadius: 999 },
  progressTrack: { height: 3, background: "#EEF2F1", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#17A673,#0F3A44)", transition: "width .3s ease" },

  body: { padding: "22px 22px 26px" },
  eyebrow: { fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#17A673", marginBottom: 6, fontFamily: "'Manrope', sans-serif" },
  h1: { fontFamily: "'Manrope', sans-serif", fontSize: 22, fontWeight: 800, lineHeight: 1.25, margin: "0 0 6px" },
  h2: { fontFamily: "'Manrope', sans-serif", fontSize: 17, fontWeight: 700, lineHeight: 1.35, margin: "6px 0 4px" },
  sub: { fontSize: 13.5, color: "#4B6169", margin: "0 0 6px", lineHeight: 1.5 },
  hint: { fontSize: 12.5, color: "#7C8C90", margin: "0 0 16px" },
  label: { display: "block", fontSize: 12.5, fontWeight: 700, color: "#0F3A44", marginBottom: 8, marginTop: 18 },
  miniLabel: { display: "block", fontSize: 11.5, fontWeight: 700, color: "#4B6169", marginBottom: 5 },
  req: { color: "#D95B43" },
  errorBox: { fontSize: 12.5, color: "#D95B43", background: "#FCEEE9", border: "1px solid #F3D3C6", borderRadius: 10, padding: "10px 12px", marginTop: 12 },

  input: { width: "100%", padding: "11px 12px", fontSize: 14, border: "1px solid #E1E8E7", borderRadius: 10, background: "#FBFCFC", color: "#0F3A44", outline: "none" },
  select: { width: "100%", padding: "11px 12px", fontSize: 14, border: "1px solid #E1E8E7", borderRadius: 10, background: "#FBFCFC", color: "#0F3A44", outline: "none" },

  chipGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  chip: { display: "flex", alignItems: "center", gap: 8, padding: "12px 12px", border: "1px solid #E1E8E7", borderRadius: 12, background: "#FBFCFC", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#0F3A44" },
  chipActive: { background: "#0F3A44", borderColor: "#0F3A44", color: "#fff" },

  primaryBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", padding: "13px 16px", background: "#17A673", color: "#fff", border: "none", borderRadius: 12, fontSize: 14.5, fontWeight: 700, cursor: "pointer" },
  ghostBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "13px 14px", background: "transparent", color: "#4B6169", border: "1px solid #E1E8E7", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  linkBtn: { background: "none", border: "none", color: "#17A673", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0 },

  birimTag: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0F3A44", background: "#EEF6F3", padding: "6px 11px", borderRadius: 999, marginBottom: 14 },
  stepLabel: { color: "#7C8C90", fontWeight: 600 },

  yesNoRow: { display: "flex", gap: 10, marginTop: 14 },
  yesNoBtn: { flex: 1, padding: "16px 10px", borderRadius: 12, border: "1px solid #E1E8E7", background: "#FBFCFC", fontSize: 14.5, fontWeight: 700, color: "#0F3A44", cursor: "pointer" },
  yesNoActiveYes: { background: "#17A673", borderColor: "#17A673", color: "#fff" },
  yesNoActiveNo: { background: "#D95B43", borderColor: "#D95B43", color: "#fff" },

  counterRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 22, margin: "18px 0 14px" },
  counterBtn: { width: 40, height: 40, borderRadius: 10, border: "1px solid #E1E8E7", background: "#FBFCFC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0F3A44" },
  counterVal: { fontFamily: "'Manrope', sans-serif", fontSize: 30, fontWeight: 800, minWidth: 40, textAlign: "center" },
  quickRow: { display: "flex", gap: 8, justifyContent: "center" },
  quickBtn: { width: 34, height: 34, borderRadius: 999, border: "1px solid #E1E8E7", background: "#FBFCFC", fontSize: 13, fontWeight: 700, color: "#0F3A44", cursor: "pointer" },
  quickBtnActive: { background: "#0F3A44", borderColor: "#0F3A44", color: "#fff" },

  locCard: { border: "1px solid #E1E8E7", borderRadius: 14, padding: 14, background: "#FBFCFC" },
  locCardHead: { fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", color: "#17A673", marginBottom: 10, textTransform: "uppercase" },

  navRow: { display: "flex", gap: 10, marginTop: 24 },

  reviewCard: { border: "1px solid #E1E8E7", borderRadius: 14, padding: 14, background: "#FBFCFC" },
  reviewCardHead: { display: "flex", alignItems: "center", gap: 7, fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 14, marginBottom: 8 },
  reviewLine: { display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "5px 0", borderTop: "1px dashed #E1E8E7" },
  reviewLineLabel: { color: "#7C8C90", fontWeight: 600 },
  reviewLineValue: { color: "#0F3A44", fontWeight: 700, textAlign: "right" },
  reviewSub: { fontSize: 11.5, color: "#4B6169", paddingLeft: 4, paddingBottom: 2 },

  doneBadge: { width: 56, height: 56, borderRadius: 999, background: "linear-gradient(135deg,#17A673,#0F3A44)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" },

  filterBar: { display: "flex", gap: 10, padding: "16px 22px", borderBottom: "1px solid #EEF2F1", flexWrap: "wrap" },
  selectWrap: { position: "relative", flex: "1 1 160px", minWidth: 150 },
  selectIcon: { position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#7C8C90", pointerEvents: "none" },
  selectField: { width: "100%", padding: "10px 30px 10px 32px", fontSize: 13.5, fontWeight: 600, border: "1px solid #E1E8E7", borderRadius: 10, background: "#FBFCFC", color: "#0F3A44", outline: "none", appearance: "none" },
  selectChevron: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#7C8C90", pointerEvents: "none" },
  clearBtn: { display: "flex", alignItems: "center", gap: 5, padding: "0 12px", border: "1px solid #E1E8E7", borderRadius: 10, background: "#FBFCFC", color: "#7C8C90", fontSize: 12.5, fontWeight: 600, cursor: "pointer" },

  empty: { padding: "50px 30px", textAlign: "center" },
  emptyIcon: { width: 46, height: 46, borderRadius: 12, background: "#F0F3F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" },
  emptyTitle: { fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#7C8C90", maxWidth: 320, margin: "0 auto", lineHeight: 1.5 },

  summaryRow: { display: "flex", gap: 12, padding: "18px 22px 4px" },
  summaryCard: { flex: 1, border: "1px solid #E1E8E7", borderRadius: 14, padding: "14px 16px", background: "linear-gradient(180deg,#FBFCFC,#F5F8F7)" },
  summaryLabel: { display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: "#17A673", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" },
  summaryValue: { fontFamily: "'Manrope', sans-serif", fontSize: 30, fontWeight: 800, lineHeight: 1 },
  summarySub: { fontSize: 11.5, color: "#7C8C90", marginTop: 4 },

  section: { padding: "18px 22px" },
  sectionHead: { display: "flex", alignItems: "center", gap: 7, fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 14.5, marginBottom: 12, color: "#0F3A44" },
  sectionEmpty: { fontSize: 13, color: "#7C8C90", background: "#FBFCFC", border: "1px dashed #E1E8E7", borderRadius: 12, padding: "14px 16px" },

  rowCard: { display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #E1E8E7", borderRadius: 12, padding: "10px 14px", background: "#FBFCFC" },
  rowMain: { display: "flex", flexDirection: "column", gap: 2 },
  rowYer: { fontSize: 13.5, fontWeight: 700, color: "#0F3A44" },
  rowTur: { fontSize: 11.5, color: "#7C8C90" },
  rowKisi: { display: "flex", alignItems: "center", gap: 5, fontSize: 13.5, fontWeight: 800, color: "#17A673", background: "#EEF6F3", padding: "5px 10px", borderRadius: 999 },

  totalBar: { marginTop: 10, fontSize: 12.5, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#0F3A44,#17A673)", padding: "10px 14px", borderRadius: 10 },
};
