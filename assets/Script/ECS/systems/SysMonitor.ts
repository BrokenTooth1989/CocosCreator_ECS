import { ComMonitor } from "../components/ComMonitor";
import { ComRoleConfig } from "../components/ComRoleConfig";
import { ComTransform } from "../components/ComTransform";
import { ECSSystem } from "../lib/ECSSystem";
import { ECSWorld, GenFillterKey } from "../lib/ECSWorld";

const FILTER_MONITOR = GenFillterKey([ComRoleConfig, ComTransform, ComMonitor]);
export class SysMonitor extends ECSSystem {
    /** 连接 */
    public onAdd(world: ECSWorld): void {

    }
    /** 断开连接 */
    public onRemove(world: ECSWorld): void {

    }
    /** 添加实体 */
    public onEntityEnter(world: ECSWorld, entity: number): void {

    }
    /**  */
    public onEntityLeave(world: ECSWorld, entity: number): void {
        let filter = world.getFilter(FILTER_MONITOR);
         // 判断当前monitor是否
         filter.entities.forEach((value: boolean, otherEntity: number) => {
            let comMonitor = world.getComponent(otherEntity, ComMonitor);
            if(!comMonitor) return ;
            for(let i=comMonitor.others.length-1; i>=0; i--) {
                if(comMonitor.others[i] == entity) {
                    comMonitor.others.splice(i);
                }
            }
        });

    }
    /** 更新 */
    public onUpdate(world: ECSWorld, dt: number): void {
        let filter = world.getFilter(FILTER_MONITOR);
        filter.walk((entity: number) => {
            let comMonitor = world.getComponent(entity, ComMonitor);
            let comTrans = world.getComponent(entity, ComTransform);
            let comRoleConfig = world.getComponent(entity, ComRoleConfig);

            // 判断当前monitor是否
            filter.entities.forEach((value: boolean, otherEntity: number) => {
                let comTransOther = world.getComponent(otherEntity, ComTransform);
                let comRoleConfigOther = world.getComponent(otherEntity, ComRoleConfig);
                if(entity == otherEntity || !comRoleConfigOther || comRoleConfigOther.team == comRoleConfig.team) return ;

                let a = cc.v2(comTrans.x, comTrans.y);

                let centerPoint = a.add(comTrans.dir.mul(comMonitor.lookLen));
                let b = centerPoint.add(cc.v2(comTrans.dir.y, -comTrans.dir.x).mul(comMonitor.lookSize));
                let c = centerPoint.add(cc.v2(-comTrans.dir.y, comTrans.dir.x).mul(comMonitor.lookSize));

                let _check = (com: ComTransform) => {
                    return (a.sub(cc.v2(com.x, com.y)).len() < comMonitor.aroundLen || isInTriangle(cc.v2(com.x, com.y), a, b, c))
                }
                for(let i=comMonitor.others.length-1; i>=0; i--) {
                    const com = world.getComponent(comMonitor.others[i], ComTransform);
                    if(!com || !_check(com)) {
                        comMonitor.others.splice(i, 1);
                    }
                }

                if(comMonitor.others.indexOf(otherEntity) == -1 && _check(comTransOther)) {
                    comMonitor.others.push(otherEntity);
                }
            });

            return false;
        });
    }

}

// 判断一个点是否在三角形内
function isInTriangle(point: cc.Vec2, triA: cc.Vec2, triB: cc.Vec2, triC: cc.Vec2) {
    let AB = triB.sub(triA), AC = triC.sub(triA), BC = triC.sub(triB), AD = point.sub(triA), BD = point.sub(triB);
    //@ts-ignore
    return (AB.cross(AC) >= 0 ^ AB.cross(AD) < 0)  && (AB.cross(AC) >= 0 ^ AC.cross(AD) >= 0) && (BC.cross(AB) > 0 ^ BC.cross(BD) >= 0); 
}