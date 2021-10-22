import sys

argument = sys.argv[1]

f = open("main.cpp", "w")
f.write(argument)
f.close()  