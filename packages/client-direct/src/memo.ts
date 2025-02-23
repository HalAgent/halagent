import { DirectClient } from "./index";
import express from "express";

export class MemoController {
    constructor(private client: DirectClient) {}

    async handleGetMemoList(req: express.Request, res: express.Response) {
        const userId = req.query.userId
        const runtime = this.getAgentId(req, res);
        if (runtime) {
            const memos =
                (await runtime.cacheManager.get(`${userId}-memos`)) ?? [];
            res.status(200).json(memos);
        }
    }

    async handleAddMemo(req: express.Request, res: express.Response) {
        const runtime = this.getAgentId(req, res);
        if (runtime) {
            const memo = req.body;
            const memos: any =
                (await runtime.cacheManager.get(`${memo.userId}-memos`)) ?? [];
            memo.id = new Date().getTime();
            memos.push(memo);
            await runtime.cacheManager.set(`${memo.userId}-memos`, memos);
            res.status(200).json(memo);
        }
    }

    async handleDeleteMomo(req: express.Request, res: express.Response) {
        const userId = req.body.userId
        const runtime = this.getAgentId(req, res);
        if (runtime) {
            const ids = req.body.ids;
            if (!ids.length) {
                return res.status(400).json({ error: "Missing memo ids" });
            }
            let memos: any =
                (await runtime.cacheManager.get(`${userId}-memos`)) ?? [];
            memos = memos.filter((memo: any) => !ids.includes(memo.id));
            await runtime.cacheManager.set(`${userId}-memos`, memos);
            res.status(200).json({ success: true });
        }
    }

    private getAgentId(req: express.Request, res: express.Response) {
        const agentId = req.params.agentId;
        if (agentId) {
            const runtime = this.client.agents.get(agentId);
            if (runtime) {
                return runtime;
            }
            res.status(404).json({ error: "Agent not found" });
            return;
        }
        res.status(400).json({ error: "Missing agent id" });
        return;
    }
}
