import { newAccountVisitor } from './account-visitor'
import { newBlockVisitor } from './block-visitor'
import { newTxVisitor } from './tx-visitor'
import { newFilter } from './filter'
import { newHeadTracker } from './head-tracker'
import { newExplainer } from './explainer'
import * as R from './rules'

export function newThor(driver: Connex.Driver): Connex.Thor {
    const headTracker = newHeadTracker(driver)

    const genesis = JSON.parse(JSON.stringify(driver.genesis)) as Connex.Thor.Block
    return {
        get genesis() { return genesis },
        get status() {
            return {
                head: headTracker.head,
                progress: headTracker.progress
            }
        },
        ticker: () => headTracker.ticker(),
        account: addr => {
            addr = R.test(addr, R.address, 'arg0').toLowerCase()
            return newAccountVisitor(driver, addr)
        },
        block: revision => {
            if (typeof revision === 'undefined') {
                revision = driver.head.id
            } else {
                R.ensure(typeof revision === 'string' ? R.isHexBytes(revision, 32) : R.isUInt(revision, 32),
                    'arg0: expected bytes32 or unsigned 32-bit integer')
            }
            return newBlockVisitor(driver, typeof revision === 'string' ? revision.toLowerCase() : revision)
        },
        transaction: id => {
            id = R.test(id, R.bytes32, 'arg0').toLowerCase()
            return newTxVisitor(driver, id)
        },
        filter: (kind: 'event' | 'transfer') => {
            R.ensure(kind === 'event' || kind === 'transfer',
                `arg0: expected 'event' or 'transfer'`)
            return newFilter(driver, kind)
        },
        explain: () => newExplainer(driver)
    }
}