from enum import Enum
import typing
import functools 
from functools import total_ordering 

class Suit(Enum):
    CLUB = 0
    DIAMOND = 1
    HEART = 2
    SPADE = 3

class Seat(Enum):
    NORTH = 0
    EAST = 1
    SOUTH = 2
    WEST = 3

@total_ordering
class Card:
    def __init__(self, suit: Suit, number: int):
        self.suit = suit
        self.number = number

    def __lt__(self, obj): 
        return (self.suit.value + self.number/100.0) < (obj.suit.value +  obj.number/100.0)
  
    def __eq__(self, obj): 
        return (self.suit == obj.suit and self.number == obj.number) 
  
    def __repr__(self): 
        return str((self.suit, self.number))


class Hand:
    def __init__(self, cards: typing.List[Card], handcount: int):
        self.cards = sorted(cards)
        self.handcount = handcount

class GameState:
    def __init__(self, hands: typing.List[Hand], lead: Seat, trump: Suit):
        self.hands = hands
        self.team1score = 0
        self.team2score = 0
        self.lead = lead
        self.dummy = Seat(lead.value + 1 % 4)
        self.trump = trump

class PersonGameState:
    def __init__(self, state: GameState, seat: Seat):
        self.hand = state.hands[seat.value]
        self.dummyhand = state.hands[state.dummy.value]
        self.team1score = state.team1score
        self.team2score = state.team2score
        self.lead = state.lead
        self.dummy = state.dummy
        self.trump = state.trump