from bridge.linparse import *
import random, math
from datetime import datetime
from bridge.score import calculate_score
import json

DEALER_MAP = {'S':1, 'W':2, 'N':3, 'E':4}
SUITS = {0:'C', 1:'D', 2:'H', 3:'S'}
RANK_NAMES = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']

'''
table_id to Table object
'''
running_tables = {}
finished_bridgehands = {}

class Game:
    '''
    players: dict {positions: usernames}
    table_id: int, the table id that this game is at
    seed: int, to get the same deal for multiple games
    '''
    def __init__(self, players: dict, table_id: int, seed: int = None):
        # sets seed to the current time if not included, seed used for the deal
        if seed == None:
            self.seed = int(datetime.now().timestamp())
        else:
            self.seed = seed
        self.game_random = random.Random(self.seed)
        
        # creates a new BridgeHand object that is continually updated as play progresses
        self.current_bridgehand = BridgeHand(players, dealer = None, hands = {}, bids = [], play = None, contract = None, declarer = None, doubled = None, vuln = None, made = 0, claimed = 0)

        self.table_id = table_id
        self.game_phase = "AUCTION"
        
        self.deal()
        self.set_dealer()
        self.set_vulnerability()
        self.current_player = self.current_bridgehand.dealer
        self.valid_bids = [str(num) + suit for num in range(1, 8) for suit in ['C', 'D', 'H', 'S', 'N']]

    def deal(self):
        '''
        creates Hand objects for each player and adds them to self.current_bridgehand
        '''
        total_hand = full_hand()
        self.game_random.shuffle(total_hand.cards)
        N_hand = Hand(total_hand.cards[0:13]).sort()
        E_hand = Hand(total_hand.cards[13:26]).sort()
        S_hand = Hand(total_hand.cards[26:39]).sort()
        W_hand = Hand(total_hand.cards[39:52]).sort()

        self.current_bridgehand.hands = {
            'N': N_hand,
            'E': E_hand,
            'S': S_hand,
            'W': W_hand
        }

    def begin_play_phase(self):
        if self.current_bridgehand.bids[-5:] == ['p', 'p', 'p', 'p']:
            running_tables[self.table_id].end_game(passout = True)
            return
        self.game_phase = "PLAY"
        self.set_contract()
        self.set_declarer()
        self.current_bridgehand.play = []

        if not self.current_bridgehand.contract[1] == 'N':
            contract_num = SUITMAP[self.current_bridgehand.contract[1]]
            starting_sorder = [3,2,0,1]
            rotation = starting_sorder.index(contract_num)
            sorder = starting_sorder[rotation:] + starting_sorder[:rotation]
            # resort the hands with trump on the left
            for direction in self.current_bridgehand.hands:
                self.current_bridgehand.hands[direction] = self.current_bridgehand.hands[direction].sort(sorder)

    def update_current_player(self) -> None:
        ''' 
        Check that the card is in the players hand.
        Make sure it is the players turn.
        See if it is the opening lead, if so make sure the right player is leading.
        If the trick has been started, check that the person is following suit.
        Add the card they played to the play dictionary. 
        Remove that card from their hand. 
        Update game state.
        '''
        if self.game_phase == "AUCTION":
            self.current_player = self.get_left_player()
            return

        # Check if the game is over
        if len(self.current_bridgehand.play) == 13 and len(self.current_bridgehand.play[-1]) == 5:
            self.current_player = None
            # Tell front end that game is over

        # Check if this is the opening lead
        elif len(self.current_bridgehand.play) == 0:
            self.current_player = self.current_bridgehand.declarer
            self.current_player = self.get_left_player()

        # check if a trick is in progress
        elif len(self.current_bridgehand.play[-1]) < 5:
            self.current_player = self.get_left_player()
        
        else:
            # if we are starting a new trick, see who won the last trick
            last_trick = self.current_bridgehand.play[-1]
            trick = {}
            trick['N'] = last_trick['N']
            trick['E'] = last_trick['E']
            trick['S'] = last_trick['S']
            trick['W'] = last_trick['W']
            self.current_player = get_trick_winner(trick, last_trick['lead'], trump=self.current_bridgehand.contract[1])[0]
                

    def get_left_player(self) -> str:
        '''
        returns the player to the left of the current player
        outputs:
            left_player: str
        '''
        return PLAYERS[(PLAYER_MAP[self.current_player] + 1) % 4]

    def play_card(self, player: str, card: Card):
        '''
        input:
            player: str (direction)
            card: Card 
        output:
            returns True of card is successfully played, False otherwise
        '''
        if self.game_phase != "PLAY":
            return False

        # check if the card is in the players hand
        if not self.current_bridgehand.hands[player].has(card):
            return False
        if not player == self.current_player:
            return False

        # start a new trick
        if len(self.current_bridgehand.play) == 0 or len(self.current_bridgehand.play[-1]) == 5:
            self.current_bridgehand.hands[player].pop_card(self.current_bridgehand.hands[player].cards.index(card))
            new_trick = {}
            new_trick['lead'] = player
            new_trick[player] = card
            self.current_bridgehand.play.append(new_trick)
            self.update_current_player()
            return True
        
        leader = self.current_bridgehand.play[-1]['lead']
        lead_suit = self.current_bridgehand.play[-1][leader].suitname
        if self.hand_contains_suit(self.current_bridgehand.hands[player], lead_suit):
            if not card.suitname == lead_suit:
                return False
            
        self.current_bridgehand.hands[player].pop_card(self.current_bridgehand.hands[player].cards.index(card))
        
        # add to most recent trick
        self.current_bridgehand.play[-1][player] = card

        # if a trick just ended, check update the number of tricks declarer has taken
        if len(self.current_bridgehand.play[-1]) == 5:
            last_trick = self.current_bridgehand.play[-1]
            trick = {}
            trick['N'] = last_trick['N']
            trick['E'] = last_trick['E']
            trick['S'] = last_trick['S']
            trick['W'] = last_trick['W']
            
            last_winner = get_trick_winner(trick, last_trick['lead'], trump=self.current_bridgehand.contract[1])[0]

            if (self.current_bridgehand.declarer == 'N' or self.current_bridgehand.declarer == 'S') and (last_winner == 'N' or last_winner == 'S'):
                self.current_bridgehand.made += 1
            if (self.current_bridgehand.declarer == 'E' or self.current_bridgehand.declarer == 'W') and (last_winner == 'E' or last_winner == 'W'):
                self.current_bridgehand.made += 1
        
            # if 13 tricks have been played end the game
            if len(self.current_bridgehand.play) == 13:
                running_tables[self.table_id].end_game()
        self.update_current_player()
        return True
    
    def get_playable_cards(self):
        '''
        return all playable cards that the current player could play
        '''
        if self.game_phase == "PLAY":
            # starting a new trick
            if len(self.current_bridgehand.play) == 0 or len(self.current_bridgehand.play[-1]) == 5:
                return self.current_bridgehand.hands[self.current_player].cards
            # following suit on a trick
            leader = self.current_bridgehand.play[-1]['lead']
            lead_suit = self.current_bridgehand.play[-1][leader].suitname
            if self.hand_contains_suit(self.current_bridgehand.hands[self.current_player], lead_suit):
                return [card for card in self.current_bridgehand.hands[self.current_player] if card.suitname == lead_suit]
            else:
                return self.current_bridgehand.hands[self.current_player].cards
        
    def hand_contains_suit(self, hand: Hand, suit: str):
        contains = False
        for card in hand.cards:
            if card.suitname == suit:
                contains = True
                break
                
        return contains

    def make_bid(self, player: str, bid: str):
        '''
        Check if the bid is valid.
        If so, update the BridgeHand auction state.
        Update valid bids for the next player.
        '''
        if self.game_phase != "AUCTION":
            return False

        if not (bid in self.valid_bids or bid == 'p'):
            return False

        if not player == self.current_player:
            return False
        
        if not (bid == 'd' or bid == 'r' or bid == 'p'):
            i = self.valid_bids.index(bid)
            self.valid_bids = self.valid_bids[i+1:]
        self.current_bridgehand.bids.append(bid)

        # check if auction is over
        if len(self.current_bridgehand.bids) > 3 and self.current_bridgehand.bids[-3:] == ['p', 'p', 'p']:
            self.begin_play_phase()
            self.update_current_player()
            return True

        # handle X
        if ((len(self.current_bridgehand.bids) > 0 and not self.current_bridgehand.bids[-1] in ['p', 'd', 'r']) 
            or (len(self.current_bridgehand.bids) > 2 and not self.current_bridgehand.bids[-3] in ['p', 'd', 'r'] and self.current_bridgehand.bids[-2:] == ['p', 'p'])):
            if not 'd' in self.valid_bids:
                self.valid_bids.append('d')
        elif 'd' in self.valid_bids:
            self.valid_bids.remove('d')

        # handle XX
        if ((len(self.current_bridgehand.bids) > 0 and self.current_bridgehand.bids[-1] == 'd') 
            or (len(self.current_bridgehand.bids) > 2 and self.current_bridgehand.bids[-4:] == ['d', 'p', 'p'])):
            self.valid_bids.append('r')
        elif 'r' in self.valid_bids:
            self.valid_bids.remove('r')
            
        self.update_current_player()
        return True    


    def set_dealer(self):
        '''
        Get who the dealer should be based on how many hands have been played so far.
        '''
        players = ['N', 'E', 'S', 'W']
        self.current_bridgehand.dealer = players[(running_tables[self.table_id].game_count - 1) % 4]

    def set_vulnerability(self):
        '''
        sets the vulnerability for the current board.
        '''
        global running_tables
        vulnerabilities = ['none', 'NS', 'EW', 'both',
                           'NS', 'EW', 'both', 'none',
                           'EW', 'both', 'none', 'NS',
                           'both', 'none', 'NS', 'EW']
        self.current_bridgehand.vuln = vulnerabilities[running_tables[self.table_id].game_count % 16]
    
    def set_contract(self):
        '''
        This function is based on linparse.
        '''
        if len(self.current_bridgehand.bids) < 1:
            return False
        
        doubles = []
        i = 1
        while (self.current_bridgehand.bids[-i] in 'drp') or (self.current_bridgehand.bids[-i] == 'p!'):
            if self.current_bridgehand.bids[-i] in 'dr':
                doubles.append(self.current_bridgehand.bids[-i])
            i += 1
        self.current_bridgehand.contract = self.current_bridgehand.bids[-i]
        self.current_bridgehand.doubled = len(doubles)

    def set_declarer(self):
        '''
        This function is based on linparse.
        '''
        if len(self.current_bridgehand.bids) < 1:
            return False
        
        BID_PLAYERS = rotate_to(self.current_bridgehand.dealer)
        csuit = self.current_bridgehand.contract[1]
        cindex = self.current_bridgehand.bids.index(self.current_bridgehand.contract)
        
        def get_snd(str):
            if len(str) == 1: return None
            else: return str[1]
        bidsuits = list(map(get_snd, self.current_bridgehand.bids))

        firstmatch = rindex(bidsuits[cindex::-2], csuit)
        
        if firstmatch % 2 == 0:
            self.current_bridgehand.declarer = BID_PLAYERS[cindex % 4]
        else:
            self.current_bridgehand.declarer = BID_PLAYERS[(cindex-2) % 4]

    def get_score(self):
        level = self.current_bridgehand.contract[0]
        suit = self.current_bridgehand.contract[1]
        doubled = self.current_bridgehand.doubled
        result = self.current_bridgehand.made
        vulnerable = self.current_bridgehand.vuln
        if vulnerable == 'both':
            vulnerable = True
        else:
            if (self.current_bridgehand.declarer == 'N' or self.current_bridgehand.declarer == 'S') \
                  and vulnerable == 'NS':
                vulnerable = True
            elif (self.current_bridgehand.declarer == 'E' or self.current_bridgehand.declarer == 'W') \
                  and vulnerable == 'EW':
                vulnerable = True
            else:
                vulnerable = False
    
        return calculate_score(int(level), suit, doubled, result, vulnerable)
    
    def get_json(self, playername: str):
        '''
        Returns a json object of relevent information for the specifed playername
        PLAYER_MAP = {'E': 0, 'S': 1, 'W': 2, 'N': 3}

        json:
        All phases
            game_phase: str ("AUCTION" or "PLAY" or "END")
            NS_score: int
            EW_score: int
            players: dict (keys: directions, values: playernames)
            current_player: str
            your_direction: str
            your_hand: list of strings "suitrank"
            hand_sizes: dict (keys: direction ints, values: numCards (int))
        "END"
            bridgehand_lin: str
        "AUCTION"
            valid_bids: list of strings
            dealer_direction: str
            bids: list of strings
        "PLAY"
            current_trick: dict (keys: directions, values: cards (int, int))
            leader: str
            dummy_direction: str
            dummy_hand: list of strings "suitrank"
            contract: string
            playable_cards: list of strings or null
        '''
        # info required regardless of game state
        your_direction = None
        for dir, name in self.current_bridgehand.players.items():
            if name == playername:
                your_direction = dir
                your_hand = [str(card) for card in self.current_bridgehand.hands[your_direction]]
        
        if your_direction == None:
            your_direction = 'Error: Player Not Found'
            your_hand = None

        hand_sizes = [0, 0, 0, 0]
        for pos, hand in self.current_bridgehand.hands.items():
            hand_sizes[PLAYER_MAP[pos]] = len(hand)

        NS_score = running_tables[self.table_id].NS_score
        EW_score = running_tables[self.table_id].EW_score

        hand_sizes = {pos:len(hand) for pos, hand in self.current_bridgehand.hands.items()}

        # info that varies based on the game phase
        if self.game_phase == 'END':
            phase_data = {'bridgehand_lin': running_tables[self.table_id].linwrite()}

        elif self.game_phase == 'AUCTION':
            phase_data = {'valid_bids': self.valid_bids,
                          'dealer': self.current_bridgehand.dealer,
                          'bids': self.current_bridgehand.bids}

        else:
            dummy = get_partner(self.current_bridgehand.declarer)
            dummy_hand = [str(card) for card in self.current_bridgehand.hands[dummy]]
           
            # first trick hasn't been played
            if len(self.current_bridgehand.play) == 0:
                leader = self.current_player
                current_trick = None
            else:
                current_trick = self.current_bridgehand.play[-1].copy()
                leader = current_trick['lead']
            
                current_trick.pop('lead')
                current_trick = {pos:str(card) for pos, card in current_trick.items()}
            
            playable_cards = []
            if your_direction != dummy:
                if your_direction == self.current_player or (your_direction == self.current_bridgehand.declarer and dummy == self.current_player):
                    playable_cards = [str(card) for card in self.get_playable_cards()]

            phase_data = {"current_trick": current_trick,
                        "leader": leader,
                        "dummy_direction": dummy,
                        "dummy_hand": dummy_hand,
                        "contract": self.current_bridgehand.contract,
                        "playable_cards": playable_cards}

        return_dict = {"game_phase": self.game_phase,
                    "NS_score": NS_score,
                    "EW_score": EW_score,
                    "players": self.current_bridgehand.players,
                    "current_player": self.current_player,
                    "your_direction": your_direction,
                    "your_hand": your_hand,
                    "hand_sizes": hand_sizes}
        
        return_dict.update(phase_data)
        return json.dumps(return_dict)

def get_partner(position: str):
    if position == 'N':
        return 'S'
    elif position == 'S':
        return 'N'
    elif position == 'E':
        return 'W'
    else:
        return 'E'

class Table:
    '''
    Stores information about tables of players.

    players: dict {positions: usernames}
    seed: int
    '''
    def __init__(self, players: dict, seed: int = None):
        self.players = players
        self.seed = seed
        self.NS_score = 0
        self.EW_score = 0
        self.game_count = 0
        self.current_game = None
        self.table_id = math.trunc(int(datetime.now().timestamp()))

        global running_tables
        running_tables[self.table_id] = self

    def new_game(self):
        '''
        creates a new game at this table
        '''
        self.game_count += 1

        if self.seed == None:
            self.current_game = Game(self.players, self.table_id, seed = None)
        else:
            self.current_game = Game(self.players, self.table_id, seed = self.seed + self.game_count)

    def end_game(self, passout = False):
        '''
        Distroy stored game state.
        Calculate and output score.
        '''
        if not passout:
            # calculate the score
            score = self.current_game.get_score()
            # add the score
            declarer = self.current_game.current_bridgehand.declarer
            if declarer == 'N' or declarer == 'S':
                if score > 0:
                    self.NS_score += score
                else:
                    self.EW_score -= score
            else:
                if score > 0:
                    self.EW_score += score
                else:
                    self.NS_score -= score

            print("tricks played", len(self.current_game.current_bridgehand.play))
            print("Tricks made", self.current_game.current_bridgehand.made)
            print("Final Score", score)

            # store the finished game somewhere (lin format eventually)
        
            # resets the bridgehands to their original configuration
            self.current_game.game_random = random.Random(self.current_game.seed)
            self.current_game.deal()

            # sets the game phase to "END" for the get_json
            self.current_game.game_phase = "END"
        
        else: #passout
            self.new_game()

        # return most recent score update?
    
    def join_table(self, playername: str, direction: str):
        '''
        "asks" to join the table if there is space at that direction
        returns false if no space at table
        '''
        if not direction in self.players:
            self.players[direction] = playername
            return True
        return False
    
    def linwrite(self):
        bridge_hand = self.current_game.current_bridgehand
        output = ''
        output += 'pn|' + bridge_hand.players['S'] + ',' + bridge_hand.players['W'] + ',' + bridge_hand.players['N'] + ',' + bridge_hand.players['E'] + '|st||md|'
        output += str(DEALER_MAP[bridge_hand.dealer])

        order = ['S', 'W', 'N']
        for dir in order:
            cards_str = 'S' + ''.join(RANK_NAMES[card.rank-2] for card in bridge_hand.hands[dir] if card.suitname == 'S') + \
                        'H' + ''.join(RANK_NAMES[card.rank-2] for card in bridge_hand.hands[dir] if card.suitname == 'H') + \
                        'D' + ''.join(RANK_NAMES[card.rank-2] for card in bridge_hand.hands[dir] if card.suitname == 'D') + \
                        'C' + ''.join(RANK_NAMES[card.rank-2] for card in bridge_hand.hands[dir] if card.suitname == 'C')
            output += cards_str + ','

        vuln = {'NS': 'n','WE': 'e','none': 'o', 'both': 'b'}
        if bridge_hand.vuln == "EW":
            bridge_hand.vuln = "WE"
        output += '|rh||ah|Board ' + str(self.game_count) + '|sv|' + vuln[bridge_hand.vuln]
        for bid in bridge_hand.bids:
            output += '|mb'
            output += '|' + bid
        for trick in bridge_hand.play:
            player = trick['lead']
            output += '|pg|'
            for i in range(4):
                output += '|pc'
                card = trick[PLAYERS[(PLAYER_MAP[player] + i) % 4]]
                card_num = card.rankname
                if card_num == '10':
                    card_num = 'T'
                suit = card.suitname
                output += '|' + suit + card_num
        output += '|pg||'

        return output
    

if __name__=="__main__": 
    pass
