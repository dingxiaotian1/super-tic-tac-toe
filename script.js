class TicTacToe {
    constructor() {
        this.board = [];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveHistory = [];
        this.maxMovesDisplayed = 6;
        this.gameMode = null; // 'ai' or 'two-player'
        this.gameStartTime = null;
        this.gameTimer = null;
        this.winningCombinations = [
            [0, 1, 2], // 横向
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6], // 纵向
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8], // 对角线
            [2, 4, 6]
        ];
        
        this.initializeEventListeners();
        this.showScreen('mode-selection');
    }
    
    initializeEventListeners() {
        // 模式选择按钮
        document.getElementById('ai-mode-btn').addEventListener('click', () => this.startGame('ai'));
        document.getElementById('two-player-btn').addEventListener('click', () => this.startGame('two-player'));
        
        // 游戏控制按钮
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('back-btn').addEventListener('click', () => this.backToMenu());
        
        // 游戏结束按钮
        document.getElementById('play-again-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.backToMenu());
    }
    
    showScreen(screenId) {
        // 隐藏所有屏幕
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        // 显示指定屏幕
        document.getElementById(screenId).classList.add('active');
    }
    
    startGame(mode) {
        this.gameMode = mode;
        this.resetGame();
        this.initializeBoard();
        this.showScreen('game-screen');
        this.updateUI();
        this.startGameTimer();
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveHistory = [];
        this.gameStartTime = Date.now();
        this.stopGameTimer();
        
        // 清除获胜线
        const winningLines = document.querySelectorAll('.winning-line');
        winningLines.forEach(line => line.remove());
    }
    
    initializeBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.handleCellClick(i));
            boardElement.appendChild(cell);
        }
    }
    
    updateUI() {
        // 更新当前玩家显示
        const currentPlayerElement = document.getElementById('current-player');
        currentPlayerElement.textContent = this.currentPlayer === 'X' ? '玩家 1' : (this.gameMode === 'ai' ? 'AI' : '玩家 2');
        currentPlayerElement.className = `player-badge ${this.currentPlayer === 'X' ? 'player1' : (this.gameMode === 'ai' ? 'ai' : 'player2')}`;
        
        // 更新玩家指示器
        document.getElementById('ai-indicator').style.display = this.gameMode === 'ai' ? 'flex' : 'none';
        document.getElementById('player2-indicator').style.display = this.gameMode === 'two-player' ? 'flex' : 'none';
        
        // 更新已落子数
        document.getElementById('move-count').textContent = this.moveHistory.length;
    }
    
    handleCellClick(index) {
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }
        
        this.makeMove(index);
        
        if (this.checkWin()) {
            this.endGame(`${this.currentPlayer === 'X' ? '玩家 1' : (this.gameMode === 'ai' ? 'AI' : '玩家 2')} 获胜！`);
        } else if (this.checkDraw()) {
            this.endGame('平局！');
        } else {
            this.switchPlayer();
            this.updateUI();
            
            // 如果是AI回合，延迟执行AI思考
            if (this.currentPlayer === 'O' && this.gameMode === 'ai') {
                this.aiMove();
            }
        }
    }
    
    makeMove(index) {
        // 如果是第7枚落子，先让第一枚闪烁
        if (this.moveHistory.length === this.maxMovesDisplayed) {
            const oldestMove = this.moveHistory[0];
            const oldestCell = document.querySelector(`[data-index="${oldestMove.index}"]`);
            oldestCell.classList.add('blink');
            
            // 延迟移除闪烁效果和最早的落子
            setTimeout(() => {
                oldestCell.classList.remove('blink');
                this.board[oldestMove.index] = '';
                oldestCell.className = 'cell';
            }, 500);
            
            // 移除最早的记录
            this.moveHistory.shift();
        }
        
        this.board[index] = this.currentPlayer;
        
        // 更新UI
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // 记录移动
        this.moveHistory.push({
            index: index,
            player: this.currentPlayer,
            cell: cell
        });
        
        // 更新已落子数
        document.getElementById('move-count').textContent = this.moveHistory.length;
    }
    
    aiMove() {
        // AI思考动画
        const currentPlayerElement = document.getElementById('current-player');
        currentPlayerElement.classList.add('thinking');
        
        // 延迟执行AI思考，模拟思考过程
        setTimeout(() => {
            currentPlayerElement.classList.remove('thinking');
            
            // AI简单策略：优先进攻，其次防守，最后随机
            const bestMove = this.findBestMove();
            this.handleCellClick(bestMove);
        }, 1000);
    }
    
    findBestMove() {
        // 检查是否能立即获胜
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWin(true)) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // 检查是否需要防守
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWin(true)) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // 优先选择中心
        if (this.board[4] === '') {
            return 4;
        }
        
        // 优先选择角落
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // 选择边缘
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(index => this.board[index] === '');
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }
        
        // 随机选择
        const availableMoves = this.board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    checkWin(simulate = false) {
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                if (!simulate) {
                    this.drawWinningLine(combination);
                }
                return true;
            }
        }
        return false;
    }
    
    drawWinningLine(combination) {
        const boardElement = document.getElementById('board');
        const line = document.createElement('div');
        line.className = 'winning-line';
        
        // 确定获胜线的类型
        if (combination[0] === 0 && combination[1] === 1 && combination[2] === 2) {
            line.classList.add('horizontal');
            line.style.top = '33.33%';
        } else if (combination[0] === 3 && combination[1] === 4 && combination[2] === 5) {
            line.classList.add('horizontal');
            line.style.top = '66.66%';
        } else if (combination[0] === 6 && combination[1] === 7 && combination[2] === 8) {
            line.classList.add('horizontal');
            line.style.top = '99.99%';
        } else if (combination[0] === 0 && combination[1] === 3 && combination[2] === 6) {
            line.classList.add('vertical');
            line.style.left = '33.33%';
        } else if (combination[0] === 1 && combination[1] === 4 && combination[2] === 7) {
            line.classList.add('vertical');
            line.style.left = '66.66%';
        } else if (combination[0] === 2 && combination[1] === 5 && combination[2] === 8) {
            line.classList.add('vertical');
            line.style.left = '99.99%';
        } else if (combination[0] === 0 && combination[1] === 4 && combination[2] === 8) {
            line.classList.add('diagonal-1');
        } else if (combination[0] === 2 && combination[1] === 4 && combination[2] === 6) {
            line.classList.add('diagonal-2');
        }
        
        boardElement.appendChild(line);
    }
    
    checkDraw() {
        // 检查当前棋盘是否已满
        return this.board.every(cell => cell !== '');
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
    
    startGameTimer() {
        this.gameStartTime = Date.now();
        this.gameTimer = setInterval(() => {
            const elapsed = Date.now() - this.gameStartTime;
            const minutes = Math.floor(elapsed / 60000).toString().padStart(2, '0');
            const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
            document.getElementById('game-time').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }
    
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
    
    endGame(message) {
        this.gameActive = false;
        this.stopGameTimer();
        
        // 显示游戏结束界面
        document.getElementById('game-result').textContent = message;
        this.showScreen('game-over');
    }
    
    restartGame() {
        this.resetGame();
        this.initializeBoard();
        this.showScreen('game-screen');
        this.updateUI();
        this.startGameTimer();
    }
    
    backToMenu() {
        this.stopGameTimer();
        this.showScreen('mode-selection');
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});