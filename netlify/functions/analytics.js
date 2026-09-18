import { BetaAnalyticsDataClient } from "@google-analytics/data";

const START_DATE = "2026-09-18";

const SECTION_NAMES = {
  "/articles": "Мақалалар",
  "/conferences": "Конференциялар",
  "/dissertations": "Диссертациялар",
  "/lectures": "Дәрістер",
  "/tasks": "Тапсырмалар",
  "/resources": "Құнды деректер",
  "/videos": "Бейнематериалдар",
};

export const handler = async function () {
  try {
    const credentials = JSON.parse(
      Buffer.from(
        process.env.GA_SERVICE_ACCOUNT_JSON_B64,
        "base64"
      ).toString("utf8")
    );

    const client = new BetaAnalyticsDataClient({ credentials });
    const property = `properties/${process.env.GA4_PROPERTY_ID}`;

    const [summary] = await client.runReport({
      property,
      dateRanges: [{ startDate: START_DATE, endDate: "today" }],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
      ],
    });

    const [pages] = await client.runReport({
      property,
      dateRanges: [{ startDate: START_DATE, endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      limit: 1000,
    });

    const [downloads] = await client.runReport({
      property,
      dateRanges: [{ startDate: START_DATE, endDate: "today" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          stringFilter: {
            matchType: "EXACT",
            value: "file_download",
          },
        },
      },
    });

    const [realtime] = await client.runRealtimeReport({
      property,
      metrics: [{ name: "activeUsers" }],
    });

    const sectionViews = Object.fromEntries(
      Object.keys(SECTION_NAMES).map((section) => [section, 0])
    );

    for (const row of pages.rows || []) {
      const path = row.dimensionValues?.[0]?.value || "";
      const views = Number(row.metricValues?.[0]?.value || 0);

      for (const section of Object.keys(SECTION_NAMES)) {
        if (path === section || path.startsWith(`${section}/`)) {
          sectionViews[section] += views;
        }
      }
    }

    const summaryValues = summary.rows?.[0]?.metricValues || [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        visitors: Number(summaryValues[0]?.value || 0),
        pageViews: Number(summaryValues[1]?.value || 0),
        activeUsersNow: Number(
          realtime.rows?.[0]?.metricValues?.[0]?.value || 0
        ),
        pdfDownloads: Number(
          downloads.rows?.[0]?.metricValues?.[0]?.value || 0
        ),
        sectionViews,
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Не удалось получить статистику",
      }),
    };
  }
};