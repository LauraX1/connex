
/** Connex driver interface */
declare namespace Connex {
    interface Driver {
        readonly genesis: Thor.Block
        /** current known head */
        readonly head: Thor.Status['head']

        /**
         * poll new head
         * rejected only when driver closed
         */
        pollHead(): Promise<Thor.Status['head']>

        getBlock(revision: string | number): Promise<Thor.Block | null>
        getTransaction(id: string, allowPending: boolean): Promise<Thor.Transaction | null>
        getReceipt(id: string): Promise<Thor.Transaction.Receipt | null>

        getAccount(addr: string, revision: string): Promise<Thor.Account>
        getCode(addr: string, revision: string): Promise<Thor.Account.Code>
        getStorage(addr: string, key: string, revision: string): Promise<Thor.Account.Storage>

        explain(arg: Driver.ExplainArg, revision: string, cacheHints?: string[]): Promise<VM.Output[]>

        filterEventLogs(arg: Driver.FilterEventLogsArg): Promise<Thor.Filter.Row<'event'>[]>
        filterTransferLogs(arg: Driver.FilterTransferLogsArg): Promise<Thor.Filter.Row<'transfer'>[]>

        // vendor methods
        signTx(msg: Vendor.TxMessage, options: Driver.TxOptions): Promise<Vendor.TxResponse>
        signCert(msg: Vendor.CertMessage, option: Driver.CertOptions): Promise<Vendor.CertResponse>
    }

    namespace Driver {
        type ExplainArg = {
            clauses: Thor.Transaction['clauses'],
            caller?: string
            gas?: number
            gasPrice?: string
        }

        type FilterEventLogsArg = {
            range: Thor.Filter.Range
            options: {
                offset: number
                limit: number
            }
            criteriaSet: Thor.Filter.Criteria<'event'>[]
            order: 'asc' | 'desc'
        }

        type FilterTransferLogsArg = {
            range: Thor.Filter.Range
            options: {
                offset: number
                limit: number
            }
            criteriaSet: Thor.Filter.Criteria<'transfer'>[]
            order: 'asc' | 'desc'
        }

        type TxOptions = {
            signer?: string
            gas?: number
            dependsOn?: string
            link?: string
            comment?: string
            delegator?: string
            onPrepared?: () => void
        }

        type CertOptions = {
            signer?: string
            link?: string
            onPrepared?: () => void
        }
    }
}