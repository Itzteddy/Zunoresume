import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import type { ResumeData, TemplateConfig } from "@/types";

const PDF_FONT: Record<string, string> = {
  sans: "Helvetica",
  serif: "Times-Roman",
  mono: "Courier",
};

// The preview sheet is rendered in CSS px (96dpi) on a 210mm-wide page.
// PDF points use 72dpi, so every px value below is scaled by 0.75 to be
// pixel-consistent at the same physical size. mm values are converted
// directly (1mm = 2.83465pt).
const MM = 2.83465;

type Props = {
  data: ResumeData;
  template: TemplateConfig;
};

export function ResumePDFDocument({ data, template }: Props) {
  const accent = template.accent;
  const fontFamily = PDF_FONT[template.font] ?? "Helvetica";
  const text = template.textColor ?? "#1c2333";

  const isBanner = template.headerStyle === "banner";
  const isCentered = template.headerStyle === "centered";
  const useSidebar = template.layout === "sidebar";
  const useSplit = template.layout === "split";
  const isClassic = !useSidebar && !useSplit;

  const sidebarBg = template.monochrome ? "#f4f5f7" : "#f0f5ff";

  const styles = StyleSheet.create({
    page: {
      fontFamily,
      color: text,
      fontSize: 9,
      lineHeight: 1.4,
    },
    header: {
      paddingHorizontal: 30,
      paddingTop: 24,
      paddingBottom: isBanner ? 24 : 12,
      backgroundColor: isBanner ? accent : "#ffffff",
      color: isBanner ? "#ffffff" : text,
      alignItems: isBanner || isCentered ? "center" : "flex-start",
      textAlign: isBanner || isCentered ? "center" : "left",
    },
    bannerPhoto: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginBottom: 9,
      borderWidth: 2.25,
      borderColor: "rgba(255,255,255,0.6)",
      objectFit: "cover",
    },
    name: {
      fontSize: 19.5,
      fontFamily,
      fontWeight: "bold",
      letterSpacing: -0.39,
      color: isBanner ? "#ffffff" : text,
    },
    title: {
      fontSize: 9.75,
      fontWeight: 600,
      color: isBanner ? "rgba(255,255,255,0.92)" : accent,
      marginTop: isBanner ? 2.25 : 1.5,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: isBanner ? 9 : 6,
      fontSize: 7.125,
      color: isBanner ? "#ffffff" : text,
      justifyContent: isBanner || isCentered ? "center" : "flex-start",
      columnGap: 12,
      rowGap: 3,
    },
    body: {
      flexDirection: "row",
      flexGrow: 1,
      paddingHorizontal: 12 * MM,
      paddingBottom: 10 * MM,
    },
    sidebarColumn: {
      width: "34%",
      padding: 12,
      backgroundColor: sidebarBg,
    },
    splitColumn: {
      width: "35%",
      paddingRight: 12,
      borderRightWidth: 1,
      borderRightColor: "#e5e9f0",
    },
    mainClassic: {
      flex: 1,
      padding: 12,
    },
    mainWithSidebar: {
      flex: 1,
      padding: 12,
    },
    mainWithDivider: {
      flex: 1,
      paddingTop: 12,
      paddingRight: 12,
      paddingBottom: 12,
      paddingLeft: 24,
    },
    section: { marginBottom: 9 },
    sectionContent: { rowGap: 6 },
    sectionTitle: {
      fontSize: 8.25,
      fontWeight: "bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4.5,
      paddingBottom: 2.25,
      borderBottomWidth: 1.5,
      borderBottomColor: accent,
    },
    sectionTitleUnderline: {
      fontSize: 8.25,
      fontWeight: "bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4.5,
      paddingBottom: 2.25,
      borderBottomWidth: 1.5,
      borderBottomColor: "#e5e9f0",
    },
    barRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4.5,
      columnGap: 6,
    },
    barTitle: {
      fontSize: 7.5,
      fontWeight: "bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 0.45,
    },
    barLine: {
      flexGrow: 1,
      height: 2.25,
      backgroundColor: accent,
      opacity: 0.25,
    },
    badgeWrap: { marginBottom: 4.5 },
    badge: {
      fontSize: 7.5,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 0.45,
      color: "#ffffff",
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 3,
      backgroundColor: accent,
      alignSelf: "flex-start",
    },
    rowHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      columnGap: 9,
    },
    rowTitle: { fontSize: 7.5, fontWeight: "bold" },
    rowPeriod: { fontSize: 6.375, color: "#64748b" },
    rowSub: { fontSize: 6.75, color: accent, fontWeight: 600 },
    text: { fontSize: 6.75, lineHeight: 1.45, marginTop: 0.75 },
    bullet: { flexDirection: "row", marginTop: 1.5, columnGap: 4.5 },
    bulletDot: { width: 6.75, fontSize: 6.75, color: accent },
    bulletText: { flex: 1, fontSize: 6.75, lineHeight: 1.4 },
    itemRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      columnGap: 4.5,
      fontSize: 6.75,
    },
    itemDot: { width: 6.75, fontSize: 6.75, color: accent },
    itemText: { flex: 1, fontSize: 6.75 },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: 12,
      rowGap: 3,
    },
    chipItem: { fontSize: 6.75 },
    interestRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: 3,
      rowGap: 3,
    },
    interestChip: {
      fontSize: 6.375,
      paddingHorizontal: 4.5,
      paddingVertical: 1.5,
      borderRadius: 3,
      backgroundColor: template.secondary ?? "#f1f5f9",
    },
    customText: { fontSize: 6.75, lineHeight: 1.5, marginBottom: 3 },
    sidebarBlock: { marginBottom: 12 },
    sidebarBlockTitle: {
      fontSize: 7.5,
      fontWeight: "bold",
      color: accent,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 3.75,
      paddingBottom: 1.5,
      borderBottomWidth: 1.125,
      borderBottomColor: accent,
    },
    sidebarContactRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      columnGap: 4.5,
      marginBottom: 3,
    },
    sidebarContactText: { flex: 1, fontSize: 6.375 },
    sidebarChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      columnGap: 3,
      rowGap: 3,
    },
    sidebarChip: {
      fontSize: 6,
      paddingHorizontal: 4.5,
      paddingVertical: 1.5,
      borderRadius: 3,
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#e5e9f0",
    },
    sidebarLangRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 6.375,
    },
    sidebarLangLevel: { color: "#64748b" },
    sidebarText: { fontSize: 6.375, lineHeight: 1.35, marginBottom: 1.5 },
    sidebarInterest: { fontSize: 6.375 },
  });

  const headerContactItems = [
    data.personal.email && { value: data.personal.email, href: `mailto:${data.personal.email}`, type: "link" },
    data.personal.phone && { value: data.personal.phone, href: `tel:${data.personal.phone.replace(/\s/g, "")}`, type: "link" },
    data.personal.location && { value: data.personal.location, href: "", type: "text" },
    data.personal.linkedin && { value: strip(data.personal.linkedin), href: withProto(data.personal.linkedin), type: "text" },
    data.personal.github && { value: strip(data.personal.github), href: withProto(data.personal.github), type: "text" },
    data.personal.portfolio && { value: strip(data.personal.portfolio), href: withProto(data.personal.portfolio), type: "text" },
    data.personal.website && { value: strip(data.personal.website), href: withProto(data.personal.website), type: "text" },
  ].filter(Boolean) as { value: string; href: string; type: "link" | "text" }[];

  const sidebarContactItems = [
    data.personal.email && { value: data.personal.email },
    data.personal.phone && { value: data.personal.phone },
    data.personal.location && { value: data.personal.location },
    data.personal.linkedin && { value: strip(data.personal.linkedin) },
    data.personal.github && { value: strip(data.personal.github) },
    data.personal.portfolio && { value: strip(data.personal.portfolio) },
  ].filter(Boolean) as { value: string }[];

  const showBannerPhoto = isBanner && template.showPhoto && data.personal.photo;

  const sidebarContent = (
    <>
      {sidebarContactItems.length > 0 && (
        <View style={styles.sidebarBlock}>
          <Text style={styles.sidebarBlockTitle}>Contact</Text>
          {sidebarContactItems.map((c, i) => (
            <View key={i} style={styles.sidebarContactRow}>
              <Text style={styles.itemDot}>•</Text>
              <Text style={styles.sidebarContactText}>{c.value}</Text>
            </View>
          ))}
        </View>
      )}
      {data.skills.length > 0 && (
        <View style={styles.sidebarBlock}>
          <Text style={styles.sidebarBlockTitle}>Skills</Text>
          <View style={styles.sidebarChips}>
            {data.skills.map((s) => (
              <Text key={s.id} style={styles.sidebarChip}>
                {s.name}
              </Text>
            ))}
          </View>
        </View>
      )}
      {data.languages.length > 0 && (
        <View style={styles.sidebarBlock}>
          <Text style={styles.sidebarBlockTitle}>Languages</Text>
          {data.languages.map((l) => (
            <View key={l.id} style={styles.sidebarLangRow}>
              <Text>{l.name}</Text>
              {l.level ? <Text style={styles.sidebarLangLevel}>{l.level}</Text> : null}
            </View>
          ))}
        </View>
      )}
      {data.certifications.length > 0 && (
        <View style={styles.sidebarBlock}>
          <Text style={styles.sidebarBlockTitle}>Certifications</Text>
          {data.certifications.map((c) => (
            <Text key={c.id} style={styles.sidebarText}>
              {c.name}
            </Text>
          ))}
        </View>
      )}
      {data.interests.length > 0 && (
        <View style={styles.sidebarBlock}>
          <Text style={styles.sidebarBlockTitle}>Interests</Text>
          <View style={styles.sidebarChips}>
            {data.interests.map((i) => (
              <Text key={i.id} style={styles.sidebarInterest}>
                {i.name}
              </Text>
            ))}
          </View>
        </View>
      )}
    </>
  );

  const mainStyle = useSplit
    ? styles.mainWithDivider
    : useSidebar
      ? styles.mainWithSidebar
      : styles.mainClassic;

  const mainContent = (
    <View style={mainStyle}>
      {data.summary && (
        <Section title="Summary" template={template} styles={styles}>
          <Text style={styles.text}>{data.summary}</Text>
        </Section>
      )}
      {data.experience.length > 0 && (
        <Section title="Experience" template={template} styles={styles}>
          {data.experience.map((e) => (
            <ExperienceRow key={e.id} {...e} styles={styles} />
          ))}
        </Section>
      )}
      {data.internships.length > 0 && (
        <Section title="Internships" template={template} styles={styles}>
          {data.internships.map((i) => (
            <ExperienceRow key={i.id} {...i} styles={styles} />
          ))}
        </Section>
      )}
      {data.projects.length > 0 && (
        <Section title="Projects" template={template} styles={styles}>
          {data.projects.map((p) => (
            <ProjectRow key={p.id} {...p} styles={styles} />
          ))}
        </Section>
      )}
      {data.education.length > 0 && (
        <Section title="Education" template={template} styles={styles}>
          {data.education.map((e) => (
            <EducationRow key={e.id} {...e} styles={styles} />
          ))}
        </Section>
      )}
      {data.skills.length > 0 && isClassic && (
        <Section title="Skills" template={template} styles={styles}>
          <View style={styles.chipRow}>
            {data.skills.map((s) => (
              <Text key={s.id} style={styles.chipItem}>
                {s.name}
                {s.level ? ` — ${s.level}` : ""}
              </Text>
            ))}
          </View>
        </Section>
      )}
      {data.certifications.length > 0 && isClassic && (
        <Section title="Certifications" template={template} styles={styles}>
          {data.certifications.map((c) => (
            <View key={c.id} style={styles.itemRow}>
              <Text style={styles.itemDot}>•</Text>
              <Text style={styles.itemText}>
                {c.name}
                {c.issuer ? <Text style={{ color: "#64748b" }}>{` — ${c.issuer}`}</Text> : null}
                {c.year ? <Text style={{ color: "#64748b" }}>{` (${c.year})`}</Text> : null}
              </Text>
            </View>
          ))}
        </Section>
      )}
      {data.achievements.length > 0 && (
        <Section title="Achievements" template={template} styles={styles}>
          {data.achievements.map((a) => (
            <View key={a.id} style={styles.itemRow}>
              <Text style={styles.itemDot}>•</Text>
              <Text style={styles.itemText}>
                <Text style={{ fontWeight: "bold" }}>{a.title}</Text>
                {a.detail ? <Text>{` — ${a.detail}`}</Text> : null}
                {a.year ? <Text style={{ color: "#64748b" }}>{` (${a.year})`}</Text> : null}
              </Text>
            </View>
          ))}
        </Section>
      )}
      {data.languages.length > 0 && isClassic && (
        <Section title="Languages" template={template} styles={styles}>
          <View style={styles.chipRow}>
            {data.languages.map((l) => (
              <Text key={l.id} style={styles.chipItem}>
                {l.name}
                {l.level ? ` — ${l.level}` : ""}
              </Text>
            ))}
          </View>
        </Section>
      )}
      {data.interests.length > 0 && isClassic && (
        <Section title="Interests" template={template} styles={styles}>
          <View style={styles.interestRow}>
            {data.interests.map((i) => (
              <Text key={i.id} style={styles.interestChip}>
                {i.name}
              </Text>
            ))}
          </View>
        </Section>
      )}
      {data.customSections.map((cs) => (
        <Section key={cs.id} title={cs.title} template={template} styles={styles}>
          {cs.items.map((item, i) => (
            <Text key={i} style={styles.customText}>
              {item.title ? <Text style={{ fontWeight: "bold" }}>{`${item.title}. `}</Text> : null}
              {item.detail}
            </Text>
          ))}
        </Section>
      ))}
    </View>
  );

  const contactColor = isBanner ? "#ffffff" : text;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {showBannerPhoto && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={data.personal.photo} style={styles.bannerPhoto} />
          )}
          <Text style={styles.name}>{data.personal.fullName || "Your Name"}</Text>
          {data.personal.title && <Text style={styles.title}>{data.personal.title}</Text>}
          {headerContactItems.length > 0 && (
            <View style={styles.contactRow}>
              {headerContactItems.map((c, i) =>
                c.type === "link" ? (
                  <Link key={i} src={c.href} style={{ color: contactColor }}>
                    {c.value}
                  </Link>
                ) : (
                  <Text key={i}>{c.value}</Text>
                )
              )}
            </View>
          )}
        </View>
        <View style={styles.body}>
          {useSidebar && <View style={styles.sidebarColumn}>{sidebarContent}</View>}
          {useSplit && <View style={styles.splitColumn}>{sidebarContent}</View>}
          {mainContent}
        </View>
      </Page>
    </Document>
  );
}

type RowStyles = ReturnType<typeof StyleSheet.create>;

function ExperienceRow(props: ExperienceProps) {
  const { styles, ...item } = props;
  const period = [item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" – ");
  return (
    <View wrap={false}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowTitle}>{item.role || item.company}</Text>
        {period && <Text style={styles.rowPeriod}>{period}</Text>}
      </View>
      {item.company && item.role && <Text style={styles.rowSub}>{item.company}</Text>}
      {item.description && <Text style={styles.text}>{item.description}</Text>}
      {item.bullets?.length > 0 &&
        item.bullets.map((b, i) => (
          <View key={i} style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{b}</Text>
          </View>
        ))}
    </View>
  );
}

type ExperienceProps = {
  styles: RowStyles;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  bullets: string[];
};

function ProjectRow(props: ProjectProps) {
  const { styles, ...item } = props;
  const period = [item.startDate, item.endDate].filter(Boolean).join(" – ");
  return (
    <View wrap={false}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        {period && <Text style={styles.rowPeriod}>{period}</Text>}
      </View>
      {item.tech && <Text style={styles.rowSub}>{item.tech}</Text>}
      {item.description && <Text style={styles.text}>{item.description}</Text>}
      {item.bullets?.length > 0 &&
        item.bullets.map((b, i) => (
          <View key={i} style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{b}</Text>
          </View>
        ))}
    </View>
  );
}

type ProjectProps = {
  styles: RowStyles;
  name: string;
  tech: string;
  startDate: string;
  endDate: string;
  description: string;
  bullets: string[];
};

function EducationRow(props: EducationProps) {
  const { styles, ...item } = props;
  const period = [item.startDate, item.endDate].filter(Boolean).join(" – ");
  const title = [item.degree, item.field].filter(Boolean).join(" in ");
  return (
    <View wrap={false}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowTitle}>{item.school}</Text>
        {period && <Text style={styles.rowPeriod}>{period}</Text>}
      </View>
      {title && <Text style={styles.rowSub}>{title}</Text>}
      {item.grade && <Text style={styles.rowPeriod}>{item.grade}</Text>}
      {item.description && <Text style={styles.text}>{item.description}</Text>}
    </View>
  );
}

type EducationProps = {
  styles: RowStyles;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade: string;
  description: string;
};

function Section({
  title,
  template,
  styles,
  children,
}: {
  title: string;
  template: TemplateConfig;
  styles: RowStyles;
  children: React.ReactNode;
}) {
  const st = template.sectionStyle;
  return (
    <View style={styles.section} minPresenceAhead={24}>
      {st === "badge" ? (
        <View style={styles.badgeWrap}>
          <Text style={styles.badge}>{title}</Text>
        </View>
      ) : st === "bar" ? (
        <View style={styles.barRow}>
          <Text style={styles.barTitle}>{title}</Text>
          <View style={styles.barLine} />
        </View>
      ) : (
        <Text style={st === "underline" ? styles.sectionTitleUnderline : styles.sectionTitle}>
          {title}
        </Text>
      )}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function strip(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function withProto(url: string) {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}
