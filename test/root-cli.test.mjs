import test from "node:test";
import assert from "node:assert/strict";
import { runRootCli } from "../bin/root-cli.mjs";

test("root cli forwards init to createWorkspace", async () => {
  const calls = [];
  await runRootCli(["init", "my-workspace"], {
    createMain: async (args) => calls.push(args),
    feishuMain: async () => {
      throw new Error("should not call feishuMain");
    }
  });
  assert.deepEqual(calls, [["my-workspace"]]);
});

test("root cli forwards doctor to feishu cli", async () => {
  const calls = [];
  await runRootCli(["doctor"], {
    createMain: async () => {
      throw new Error("should not call createMain");
    },
    feishuMain: async (args) => calls.push(args)
  });
  assert.deepEqual(calls, [["doctor"]]);
});

test("root cli forwards bridge smoke to feishu cli", async () => {
  const calls = [];
  await runRootCli(["bridge", "smoke"], {
    createMain: async () => {
      throw new Error("should not call createMain");
    },
    feishuMain: async (args) => calls.push(args)
  });
  assert.deepEqual(calls, [["bridge", "smoke"]]);
});

test("root cli forwards automation install to createWorkspace", async () => {
  const calls = [];
  await runRootCli(["automation", "install", "my-workspace"], {
    createMain: async (args) => calls.push(args),
    feishuMain: async () => {
      throw new Error("should not call feishuMain");
    }
  });
  assert.deepEqual(calls, [["automation", "install", "my-workspace"]]);
});
