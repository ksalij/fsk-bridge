from bridge.linparse import *
import random, math
from datetime import datetime
from bridge.score import calculate_score
'''
table_id to Table object
'''
running_tables = {}
game_counter = 0
finished_bridgehands = {}

def update_game_state():
    '''
    Call after most functions to send an updatated game state to the front-end.
    '''
    pass

class Game:
    '''
    players: dict {positions: usernames}
    table_id: int, the table id that this game is at
    seed: int, to get the same deal for multiple games
    '''
    def __init__(self, players: dict, table_id: int, seed: int = None):
        # sets seed to the current time if not included, seed used for the deal
        if seed == None:
            seed = int(datetime.now().timestamp())
        self.game_random = random.Random(seed)
        
        # creates a new BridgeHand object that is continually updated as play progresses
        self.current_bridgehand = BridgeHand(players, dealer = None, hands = {}, bids = [], play = None, contract = None, declarer = None, doubled = None, vuln = None, made = 0, claimed = 0)

        self.table_id = table_id
        self.game_phase = "AUCTION"
        
        self.deal()
        self.set_dealer()
        self.set_vulnerability()
        self.current_player = self.current_bridgehand.dealer
        self.valid_bids = [str(num) + suit for num in range(1, 8) for suit in ['C', 'D', 'H', 'S']]

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
        self.game_phase = "PLAY"
        self.current_bridgehand.play = []

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
        # Check if the game is over
        if len(self.current_bridgehand.play) == 13 and len(self.current_bridgehand.play[-1]) == 5:
            self.current_player = None
            # Tell front end that game is over

        # Check if this is the opening lead
        elif len(self.current_bridgehand.play) == 0:
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
                
        return

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
        Return all valid bids for the next player.
        '''
        if not bid in self.valid_bids:
            return False
        
        if not player == self.current_player:
            return False
        
        # handle X
        
        if ((len(self.current_bridgehand.bids) > 0 and not self.current_bridgehand.bids[-1] in ['p', 'd', 'r']) 
            or (len(self.current_bridgehand.bids) > 2 and True)):
            pass

        # handle XX
        # handle regular bids
        
        i = self.valid_bids.index(bid)
        self.valid_bids = self.valid_bids[i+1:]
        print("new valid bids", self.valid_bids)
        self.current_bridgehand.bids.append(bid)
        return True    


    def set_dealer(self):
        '''
        Get who the dealer should be based on how many hands have been played so far.
        '''
        game_count = len(running_tables[self.table_id].game_id_list)
        players = ['E', 'S', 'W', 'N']
        self.current_bridgehand.dealer = players[game_count % 4]

    def set_vulnerability(self):
        '''
        sets the vulnerability for the current board.
        '''
        global running_tables
        game_count = len(running_tables[self.table_id].game_id_list)
        vulnerabilities = ['none', 'NS', 'EW', 'both',
                           'NS', 'EW', 'both', 'none',
                           'EW', 'both', 'none', 'NS',
                           'both', 'none', 'NS', 'EW']
        self.current_bridgehand.vuln = vulnerabilities[game_count % 16]
    
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


class Table:
    '''
    Stores information about tables of players.

    players: dict (keys: positions)
    seed: int
    '''
    def __init__(self, players: dict, seed: int = None):
        self.players = players
        self.seed = seed
        self.NS_score = 0
        self.EW_score = 0
        self.current_game = None
        self.game_id_list = []
        self.table_id = math.trunc(int(datetime.now().timestamp()))

        global running_tables
        running_tables[self.table_id] = self

    def new_game(self):
        '''
        creates a new game at this table
        gives it a game_id based on the global game_counter variable 
        (should be replaced by something with regards to the database so game_ids are not repeated)
        
        '''
        global game_counter
        game_counter += 1
        game_id = game_counter
        
        num_games = len(self.game_id_list)
        self.current_game = Game(self.players, self.table_id, seed = self.seed + num_games)
        self.game_id_list.append(game_id)

    def end_game(self):
        '''
        Distroy stored game state.
        Calculate and output score.
        '''
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

        # set current_game to none
        self.current_game = None
        # store the finished game somewhere (lin format eventually)
    
    def join_table(self, playername: str, direction: str):
        '''
        "asks" to join the table if there is space at that direction
        returns false if no space at table
        '''
        if not direction in self.players:
            self.players[direction] = playername
            return True
        return 
    

if __name__=="__main__": 
    pass
