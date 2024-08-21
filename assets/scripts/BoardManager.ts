import {
    _decorator,
    Component,
    instantiate,
    Label,
    Node,
    Prefab,
    UITransform,
} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BoardManager')
export class BoardManager extends Component {
    @property(Node)
    private maskNode: Node = null;
    @property(Node)
    private dialogNode: Node = null;
    @property(Label)
    private dialogLabel: Label = null;
    @property(Prefab)
    private cellPrefab: Prefab = null; // 网格单元预制体
    @property(Prefab)
    private blackPiecePrefab: Prefab = null;

    @property(Prefab)
    private whitePiecePrefab: Prefab = null;

    private isBlackTurn: boolean = true; // 用于跟踪当前玩家是否为黑棋
    private boardSize: number = 15;
    private cellSize: number = 40; // 每个格子的大小
    private boardMap: number[][] = []; //棋盘数组
    start() {
        this.setupBoard();
        this.createBoard();
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    setupBoard() {
        // 设置棋盘的宽高
        // const boardWidth = this.cellSize * 15;
        // const boardHeight = this.cellSize * 15;
        // this.node.getComponent(UITransform).width = boardWidth;
        // this.node.getComponent(UITransform).height = boardHeight;
        console.log(this.node.getComponent(UITransform).width);
    }
    onTouchEnd(event) {
        const touchLocation = event.getLocation();
        const localPosition = this.node.getPosition();
        console.log('触发', touchLocation.x, touchLocation.y);
        // 计算点击位置对应的棋盘格子位置
        const cellSize = 40; // 根据实际棋盘格子的大小调整
        const x = Math.floor(touchLocation.x / cellSize);
        const y = Math.floor((touchLocation.y + this.cellSize) / cellSize);

        // 确保点击位置在棋盘范围内
        if (
            x >= 0 &&
            x < this.cellSize * 15 &&
            y >= 0 &&
            y < this.cellSize * 15
        ) {
            this.placePiece(x, y);
        }
    }
    //点击放置棋子
    placePiece(x: number, y: number) {
        console.log(x, y);
        if (this.boardMap[x][y]) {
            console.log('此处已落子，不可重复落子');
            return;
        }

        const piecePrefab = this.isBlackTurn
            ? this.blackPiecePrefab
            : this.whitePiecePrefab;
        const piece = instantiate(piecePrefab);
        this.boardMap[x][y] = this.isBlackTurn ? 2 : 1;
        piece.parent = this.node;

        // 计算棋子的放置位置
        const cellSize = 40; // 根据实际棋盘格子的大小调整
        piece.setPosition(
            x * cellSize + cellSize / 2,
            y * cellSize + cellSize / 2
        );

        // 切换当前玩家
        this.isBlackTurn = !this.isBlackTurn;
        //判定胜负
        const result = this.judgement(x, y);
        console.log(this.isBlackTurn);
        if (result) {
            console.log('游戏结束,', this.isBlackTurn ? '黑子胜' : '白子胜');
            this.maskNode.active = true;
            const label = this.dialogLabel.getComponent(Label);
            label.string =
                '游戏结束：' + this.isBlackTurn ? '黑子胜' : '白子胜';
        }
    }
    judgement(x: number, y: number) {
        const player = this.boardMap[x][y];

        // Check all 4 directions
        const directions = [
            [0, 1], // Horizontal
            [1, 0], // Vertical
            [1, 1], // Main diagonal
            [1, -1], // Anti diagonal
        ];

        for (const [dx, dy] of directions) {
            if (
                this.checkDirection(x, y, dx, dy, player) ||
                this.checkDirection(x, y, -dx, -dy, player)
            ) {
                return true;
            }
        }
        return false;
    }
    //确保x,y的值在范围内，如果到边界就不用判断了
    private inBounds(x: number, y: number): boolean {
        return (
            x >= 0 &&
            x < this.boardMap.length &&
            y >= 0 &&
            y < this.boardMap[0].length
        );
    }

    private checkDirection(
        x: number,
        y: number,
        dx: number,
        dy: number,
        player: number
    ): boolean {
        let count = 0;
        for (let i = 0; i < 5; i++) {
            const nx = x + i * dx;
            const ny = y + i * dy;
            if (this.inBounds(nx, ny) && this.boardMap[nx][ny] === player) {
                count++;
            } else {
                break;
            }
        }
        return count === 5;
    }
    update(deltaTime: number) {}
    //生成棋盘
    createBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            this.boardMap.push([]);
            for (let j = 0; j < this.boardSize; j++) {
                this.boardMap[i].push(0);
                const cell = instantiate(this.cellPrefab);
                cell.parent = this.node;
                cell.getComponent(UITransform).anchorX = 0;
                cell.getComponent(UITransform).anchorY = 0;
                cell.getComponent(UITransform).width = this.cellSize;
                cell.getComponent(UITransform).height = this.cellSize;
                cell.setPosition(
                    (i - 1) * this.cellSize + this.cellSize * 1.5,
                    (j - 1) * this.cellSize + this.cellSize * 1.5
                );
            }
        }
    }
}
