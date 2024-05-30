from bridge.linparse import *
# import sys
import os 
import csv

SUIT_VALUES = {"C": 0, "D": 1, "H": 2, "S": 3, "N": 4}
REV_SUIT_VALUES = {0: "C", 1: "D", 2: "H", 3: "S", 4: "N"}

# 35(auction NS) + 35(auction EW) + 52(hand), 35(bid)
def vectorize_for_bid(bridge_hand, ai_player):
    auction = vectorize_auction(bridge_hand)
    hand = vectorize_hand(bridge_hand, ai_player)
    return auction[0] + auction[1] + auction[2] + auction[3] + hand

def vectorize_auction(bridge_hand):
    auction_N = ["0"] * 35
    auction_S = ["0"] * 35
    auction_E = ["0"] * 35
    auction_W = ["0"] * 35

    for i in range(len(bridge_hand.bids)):
        bid = bridge_hand.bids[i]
        if not (bid == 'p' or bid == 'd' or bid == 'r'):
            bid = list(bid)
            index = (int(bid[0]) - 1) * 5 + SUIT_VALUES[bid[1]]
            if bridge_hand.dealer == 'N':
                if i % 4 == 0:
                    auction_N[index] = "1"
                elif i % 4 == 1:
                    auction_E[index] = "1"
                elif i % 4 == 2:
                    auction_S[index] = "1"
                elif i % 4 == 3:
                    auction_W[index] = "1" 
            elif bridge_hand.dealer == 'E':
                if i % 4 == 0:
                    auction_E[index] = "1"
                elif i % 4 == 1:
                    auction_S[index] = "1"
                elif i % 4 == 2:
                    auction_W[index] = "1"
                elif i % 4 == 3:
                    auction_N[index] = "1" 
            elif bridge_hand.dealer == 'S':
                if i % 4 == 0:
                    auction_S[index] = "1"
                elif i % 4 == 1:
                    auction_W[index] = "1"
                elif i % 4 == 2:
                    auction_N[index] = "1"
                elif i % 4 == 3:
                    auction_E[index] = "1" 
            elif bridge_hand.dealer == 'W':
                if i % 4 == 0:
                    auction_W[index] = "1"
                elif i % 4 == 1:
                    auction_N[index] = "1"
                elif i % 4 == 2:
                    auction_E[index] = "1"
                elif i % 4 == 3:
                    auction_S[index] = "1"
    return auction_N, auction_S, auction_E, auction_W

def vectorize_hand(bridge_hand, ai_player):
    hand_vector = ["0"] * 52
    hand = bridge_hand.hands[ai_player]

    for card in hand:
        hand_vector[card.suit * 13 + card.rank - 2] = "1"
    
    return hand_vector
