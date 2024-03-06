const { Configuration, FaradayClient } = require("@fdy/faraday-js");
const deepEqual = require("deep-equal");
const assert = require("assert");

const PARENT_ACCOUNT_API_KEY = process.argv[2];
const CHILD_ACCOUNT_API_KEY = process.argv[3];

async function makeCohorts() {
  const parent = new FaradayClient(
    new Configuration({
      headers: {
        authorization: `Bearer ${PARENT_ACCOUNT_API_KEY}`,
      },
    })
  );
  const child = new FaradayClient(
    new Configuration({
      headers: {
        authorization: `Bearer ${CHILD_ACCOUNT_API_KEY}`,
      },
    })
  );
  assert(child.accountId === parent.id, "Child must belong to parent");
  const parentCohorts = await parent.cohorts.getCohorts();
  const childCohorts = await child.cohorts.getCohorts();
  for (parentCohort of parentCohorts) {
    console.log("Cohort: " + parentCohort.name);
    if (typeof parentCohort.stream_name !== "undefined") {
      console.log("  Skipping because it's based on first party data.");
      continue;
    }
    if (
      typeof parentCohort.traits === "undefined" ||
      parentCohort.traits.length === 0
    ) {
      console.log("  Skipping because it has no FIG traits.");
      continue;
    }
    const childCohort = childCohorts.find((c) => c.name === parentCohort.name);
    if (childCohort) {
      console.log("  Found existing cohort on child account.");
      if (!deepEqual(childCohort.traits, parentCohort.traits)) {
        console.log("  Updating because traits do not match.");
        await child.cohorts.updateCohort(childCohort.id, {
          name: parentCohort.name,
          traits: parentCohort.traits,
        });
      } else {
        console.log("  Not updating because traits already match.");
      }
    } else {
      console.log("  Creating cohort");
      await child.cohorts.createCohort({
        name: parentCohort.name,
        traits: parentCohort.traits,
      });
    }
  }
}

makeCohorts();
