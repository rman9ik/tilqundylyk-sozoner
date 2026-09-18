import { BetaAnalyticsDataClient } from "@google-analytics/data";

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
      dateRanges: [
        {
          startDate: "2026-09-18",
          endDate: "today",
        },
      ],
      metrics: [
        { name: "totalUsers" },
        { name: "screenPageViews" },
      ],
    });

    const [articles] = await client.runReport({
      property,
      dateRanges: [
        {
          startDate: "2026-09-18",
          endDate: "today",
        },
      ],
      dimensions: [{ name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: "/articles/",
          },
        },
      },
      orderBys: [
        {
          metric: {
            metricName: "screenPageViews",
          },
          desc: true,
        },
      ],
      limit: 5,
    });

    const summaryValues = summary.rows?.[0]?.metricValues || [];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
      body: JSON.stringify({
        visitors: Number(summaryValues[0]?.value || 0),
        pageViews: Number(summaryValues[1]?.value || 0),
        articles: (articles.rows || []).map((row) => ({
          title: row.dimensionValues?.[0]?.value || "Без названия",
          views: Number(row.metricValues?.[0]?.value || 0),
        })),
      }),
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Не удалось получить статистику",
      }),
    };
  }
};